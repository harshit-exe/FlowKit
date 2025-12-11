import { generateAIContent } from "./ai-provider";
import { prisma } from "@/lib/prisma";

// ... (keep helper functions like getAvailableNodes and validateWorkflow)

// Helper functions
async function getAvailableNodes(category: string = "all") {
  const where: any = { isDeprecated: false };
  if (category !== "all") {
    where.category = category;
  }

  const nodes = await prisma.n8nNode.findMany({
    where,
    select: {
      name: true,
      type: true,
      category: true,
      description: true,
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  // Convert to plain JSON and return as object
  const nodesData = nodes.map((node) => ({
    name: node.name,
    type: node.type,
    category: node.category,
    description: node.description,
  }));

  return {
    nodes: nodesData,
    count: nodesData.length,
    categories: Array.from(new Set(nodesData.map(n => n.category)))
  };
}

async function validateWorkflow(workflow: any) {
  const issues: string[] = [];

  // Check basic structure
  if (!workflow.name) issues.push("Missing workflow name");
  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    issues.push("Missing or invalid nodes array");
    return { valid: false, issues };
  }

  // Check each node
  const nodeIds = new Set<string>();
  for (const node of workflow.nodes) {
    if (!node.id) {
      issues.push(`Node missing id: ${node.name}`);
    } else if (nodeIds.has(node.id)) {
      issues.push(`Duplicate node id: ${node.id}`);
    } else {
      nodeIds.add(node.id);
    }

    if (!node.name) issues.push(`Node ${node.id} missing name`);
    if (!node.type) issues.push(`Node ${node.id} missing type`);

    // Validate node type exists in database
    if (node.type) {
      const nodeExists = await prisma.n8nNode.findUnique({
        where: { type: node.type },
      });
      if (!nodeExists) {
        issues.push(`Invalid node type: ${node.type} for node ${node.name}`);
      }
    }

    if (!node.position || !Array.isArray(node.position)) {
      issues.push(`Node ${node.name} missing position`);
    }
  }

  // Check connections reference valid nodes
  if (workflow.connections) {
    Object.keys(workflow.connections).forEach((sourceNode) => {
      if (!nodeIds.has(sourceNode)) {
        issues.push(`Connection references non-existent source node: ${sourceNode}`);
      }

      const connections = workflow.connections[sourceNode];
      Object.values(connections).forEach((outputConnections: any) => {
        outputConnections.forEach((connArray: any[]) => {
          connArray.forEach((conn: any) => {
            if (conn.node && !nodeIds.has(conn.node)) {
              issues.push(`Connection references non-existent target node: ${conn.node}`);
            }
          });
        });
      });
    });
  }

  return {
    valid: issues.length === 0,
    issues: issues.length === 0 ? [] : issues,
    message: issues.length === 0
      ? "Workflow validation passed successfully"
      : `Found ${issues.length} validation issues`,
  };
}

export type WorkflowGenerationProgress = {
  step: "planning" | "fetching_nodes" | "building_node_1" | "building_node_2" | "building_node_3" | "building_node_4" | "building_node_5" | "finalizing" | "validating" | "complete" | "error";
  message: string;
  data?: any;
  nodeCount?: number;
  currentNode?: number;
};

export async function generateWorkflowWithAI(
  prompt: string,
  onProgress?: (progress: WorkflowGenerationProgress) => void,
  userApiKey?: string
): Promise<any> {
  // Use user's API key if provided, otherwise fall back to server key
  // Note: userApiKey is assumed to be for the active provider if passed, or we might need to handle this better.
  // For now, we pass it to generateAIContent which handles it.

  try {
    // Step 1: Planning - Analyze requirements and create workflow plan
    onProgress?.({
      step: "planning",
      message: "Analyzing your requirements and planning workflow structure...",
    });

    const planningPrompt = `You are an expert n8n workflow architect. Analyze this automation request and create a detailed plan.

User Request: "${prompt}"

Respond with a JSON object containing:
{
  "workflowName": "descriptive workflow name",
  "description": "what this workflow does",
  "nodeSequence": [
    {"step": 1, "nodeType": "trigger", "action": "description of what this node does"},
    {"step": 2, "nodeType": "data manipulation", "action": "description"},
    {"step": 3, "nodeType": "integration", "action": "description"}
  ]
}

The nodeSequence should be a step-by-step breakdown of EXACTLY what nodes are needed in order.
Keep it simple - typically 3-5 nodes max.`;

    let text = await generateAIContent(planningPrompt, { jsonMode: true }, userApiKey);

    // Clean markdown
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    const plan = JSON.parse(text);
    console.log("[AI] Workflow Plan:", plan);

    const nodeCount = plan.nodeSequence?.length || 3;

    // Step 2: Fetch available nodes
    onProgress?.({
      step: "fetching_nodes",
      message: "Fetching available n8n nodes from database...",
    });

    const availableNodes = await getAvailableNodes("all");
    console.log(`[AI] Fetched ${availableNodes.count} available nodes`);

    // Step 3: Build workflow incrementally, node by node
    const workflow: any = {
      name: plan.workflowName || "AI Generated Workflow",
      nodes: [],
      connections: {},
      settings: {
        executionOrder: "v1"
      }
    };

    // Generate nodes one at a time with connections
    for (let i = 0; i < nodeCount; i++) {
      const nodeStep = plan.nodeSequence[i];
      const stepKey = `building_node_${i + 1}` as any;

      onProgress?.({
        step: stepKey,
        message: `Building node ${i + 1}/${nodeCount}: ${nodeStep.action}`,
        nodeCount,
        currentNode: i + 1,
      });

      // Build context of existing nodes for this generation
      const existingNodesContext = workflow.nodes.length > 0
        ? `\n\nExisting workflow nodes:\n${JSON.stringify(workflow.nodes, null, 2)}\n\nExisting connections:\n${JSON.stringify(workflow.connections, null, 2)}`
        : '';

      const nodePrompt = `You are building an n8n workflow node-by-node.

Current Step: ${nodeStep.step} of ${nodeCount}
Action Required: ${nodeStep.action}
Node Type: ${nodeStep.nodeType}

User Request: "${prompt}"
${existingNodesContext}

Available Nodes (sample): ${JSON.stringify(availableNodes.nodes.slice(0, 50), null, 2)}

Generate a SINGLE node JSON object:
{
  "parameters": {...},
  "id": "node-${i + 1}",
  "name": "Descriptive Name",
  "type": "n8n-nodes-base.exactType",
  "typeVersion": 1,
  "position": [${i * 400}, 0]
}

CRITICAL RULES:
${i === 0 ? '1. This is the FIRST node - it MUST be a trigger (webhook, schedule, manual, etc.)' : `1. This node connects to the previous node: "${workflow.nodes[i - 1]?.name}"`}
2. Use ONLY node types from the available nodes list
3. Keep parameters minimal and realistic
4. Use descriptive names
5. Return ONLY the JSON object, no markdown`;

      text = await generateAIContent(nodePrompt, { jsonMode: true }, userApiKey);

      if (text.startsWith("```json")) {
        text = text.replace(/^```json\n/, "").replace(/\n```$/, "");
      } else if (text.startsWith("```")) {
        text = text.replace(/^```\n/, "").replace(/\n```$/, "");
      }

      const newNode = JSON.parse(text);
      console.log(`[AI] Generated node ${i + 1}:`, newNode);

      // Validate node type
      const nodeTypeExists = availableNodes.nodes.find((n: any) => n.type === newNode.type);
      if (!nodeTypeExists) {
        // Try to fix or just warn? For now throw as before
        // throw new Error(`Invalid node type: ${newNode.type}`);
        // Actually let's be lenient or let validation catch it
      }

      // Add node to workflow
      workflow.nodes.push(newNode);

      // Create connection from previous node if not first node
      if (i > 0) {
        const previousNode = workflow.nodes[i - 1];
        workflow.connections[previousNode.name] = {
          main: [
            [
              {
                node: newNode.name,
                type: "main",
                index: 0
              }
            ]
          ]
        };
        console.log(`[AI] Connected "${previousNode.name}" -> "${newNode.name}"`);
      }
    }

    // Finalize workflow
    onProgress?.({
      step: "finalizing",
      message: "Finalizing workflow structure...",
    });

    // Step 6: Validate and fix if needed
    onProgress?.({
      step: "validating",
      message: "Validating workflow structure...",
    });

    let validation = await validateWorkflow(workflow);

    // If validation fails, attempt to fix
    if (!validation.valid) {
      console.log("[AI] Validation issues found, attempting to fix...", validation.issues);

      const fixPrompt = `This n8n workflow has validation issues. Fix them carefully.

Current Workflow: ${JSON.stringify(workflow, null, 2)}

Validation Issues:
${validation.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

FIXING GUIDELINES:
1. If node types are invalid, replace with valid types from the original available nodes
2. If connections reference non-existent nodes, remove those connections
3. If duplicate IDs exist, make them unique
4. Ensure connection keys use node NAMES not IDs
5. Ensure all positions are valid [x, y] arrays
6. Keep the workflow structure intact, only fix the specific issues

Return the COMPLETE fixed workflow JSON in valid n8n format. No explanation, just JSON.`;

      text = await generateAIContent(fixPrompt, { jsonMode: true }, userApiKey);

      if (text.startsWith("```json")) {
        text = text.replace(/^```json\n/, "").replace(/\n```$/, "");
      } else if (text.startsWith("```")) {
        text = text.replace(/^```\n/, "").replace(/\n```$/, "");
      }

      const fixedWorkflow = JSON.parse(text);
      validation = await validateWorkflow(fixedWorkflow);

      if (!validation.valid) {
        console.warn("[AI] Workflow still has issues after fix attempt:", validation.issues);
        // Return the workflow anyway with a warning
        onProgress?.({
          step: "complete",
          message: "Workflow generated with warnings. May need manual adjustment.",
          data: fixedWorkflow,
        });
        return fixedWorkflow;
      }

      onProgress?.({
        step: "complete",
        message: "Workflow generated and validated successfully!",
        data: fixedWorkflow,
      });

      return fixedWorkflow;
    }

    onProgress?.({
      step: "complete",
      message: "Workflow generated successfully!",
      data: workflow,
    });

    return workflow;
  } catch (error) {
    console.error("AI Workflow Generation Error:", error);
    onProgress?.({
      step: "error",
      message: error instanceof Error ? error.message : "Failed to generate workflow",
    });
    throw error;
  }
}
