import { GoogleGenerativeAI, SchemaType, type Tool } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define tools for AI to call
const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "get_available_nodes",
        description: "Fetches list of available n8n nodes from the database with their types, descriptions, and parameters",
        parameters: {
          type: SchemaType.OBJECT as const,
          properties: {
            category: {
              type: SchemaType.STRING as const,
              format: "enum" as const,
              description: "Filter by category: Core, Trigger, Integration, Database, or all",
              enum: ["Core", "Trigger", "Integration", "Database", "all"],
            },
          },
          required: [],
        },
      },
      {
        name: "validate_workflow",
        description: "Validates if a workflow JSON structure is correct and all node types exist",
        parameters: {
          type: SchemaType.OBJECT as const,
          properties: {
            workflow: {
              type: SchemaType.OBJECT as const,
              description: "The workflow JSON to validate",
              properties: {},
            },
          },
          required: ["workflow"],
        },
      },
    ],
  },
];

// Tool function implementations
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

// Function to handle tool calls
async function handleToolCall(functionCall: any) {
  const functionName = functionCall.name;
  const args = functionCall.args;

  console.log(`[AI TOOL CALL] ${functionName}`, args);

  switch (functionName) {
    case "get_available_nodes":
      return await getAvailableNodes(args.category);
    case "validate_workflow":
      return await validateWorkflow(args.workflow);
    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}

export type WorkflowGenerationProgress = {
  step: "planning" | "fetching_nodes" | "selecting_nodes" | "generating" | "validating" | "complete" | "error";
  message: string;
  data?: any;
};

export async function generateWorkflowWithAI(
  prompt: string,
  onProgress?: (progress: WorkflowGenerationProgress) => void
): Promise<any> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    tools,
  });

  try {
    // Step 1: Planning
    onProgress?.({
      step: "planning",
      message: "Analyzing your requirements and planning workflow structure...",
    });

    const systemPrompt = `You are an expert n8n workflow builder. Your task is to create a valid, production-ready n8n workflow JSON based on the user's requirements.

IMPORTANT INSTRUCTIONS:
1. FIRST, call get_available_nodes() to fetch the complete list of available n8n node types
2. ONLY use node types that exist in the returned list
3. Plan the workflow structure with appropriate triggers and actions
4. Generate valid n8n workflow JSON with this exact structure:
{
  "name": "Workflow Name",
  "nodes": [
    {
      "parameters": {},
      "id": "unique-uuid-format-id",
      "name": "Node Name",
      "type": "exact-node-type-from-available-list",
      "typeVersion": 1,
      "position": [x, y]
    }
  ],
  "connections": {
    "source-node-name": {
      "main": [
        [
          {
            "node": "target-node-name",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1"
  }
}

5. After generating, call validate_workflow() to ensure correctness
6. If validation fails, fix the issues and validate again
7. Return ONLY the final valid JSON workflow

User Request: ${prompt}

Now, start by calling get_available_nodes() to see what node types are available.`;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
      ],
    });

    let result = await chat.sendMessage(prompt);
    let response = result.response;
    let functionCallCount = 0;
    const maxFunctionCalls = 10;

    // Handle function calls in loop
    let functionCalls = response.functionCalls();
    while (functionCalls && functionCallCount < maxFunctionCalls) {
      functionCallCount++;

      // Update progress based on function call
      if (functionCalls[0].name === "get_available_nodes") {
        onProgress?.({
          step: "fetching_nodes",
          message: "Fetching available n8n nodes from database...",
        });
      } else if (functionCalls[0].name === "validate_workflow") {
        onProgress?.({
          step: "validating",
          message: "Validating generated workflow structure...",
        });
      }

      // Execute function calls and build responses
      const functionResponseParts = [];

      for (const fc of functionCalls) {
        const apiResponse = await handleToolCall(fc);

        console.log(`[AI] Function ${fc.name} returned:`, JSON.stringify(apiResponse, null, 2));

        // Create function response in correct format for Gemini
        functionResponseParts.push({
          functionResponse: {
            name: fc.name,
            response: apiResponse,
          },
        });
      }

      console.log("[AI] Sending function responses:", JSON.stringify(functionResponseParts, null, 2));

      // Update progress after fetching nodes
      if (functionCalls[0].name === "get_available_nodes") {
        onProgress?.({
          step: "selecting_nodes",
          message: "Selecting appropriate nodes for your workflow...",
        });
      }

      // Send function results back to AI
      // Note: We send as an array of parts
      try {
        const nextResult = await chat.sendMessage(functionResponseParts);
        result = nextResult;
        response = result.response;
        functionCalls = response.functionCalls();
      } catch (error) {
        console.error("[AI] Error sending function response:", error);
        throw error;
      }
    }

    // Step 5: Parse final response
    onProgress?.({
      step: "generating",
      message: "Finalizing workflow JSON...",
    });

    const text = response.text();
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    // Parse workflow JSON
    const workflowJson = JSON.parse(jsonText);

    // Final validation
    const validation = await validateWorkflow(workflowJson);
    if (!validation.valid) {
      onProgress?.({
        step: "error",
        message: `Validation failed: ${validation.issues.join(", ")}`,
      });
      throw new Error(`Workflow validation failed: ${validation.issues.join(", ")}`);
    }

    onProgress?.({
      step: "complete",
      message: "Workflow generated successfully!",
      data: workflowJson,
    });

    return workflowJson;
  } catch (error) {
    console.error("AI Workflow Generation Error:", error);
    onProgress?.({
      step: "error",
      message: error instanceof Error ? error.message : "Failed to generate workflow",
    });
    throw error;
  }
}
