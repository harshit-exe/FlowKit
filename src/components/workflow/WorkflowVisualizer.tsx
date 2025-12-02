"use client";

import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Panel,
  MarkerType,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { Activity, Database, Mail, Globe, Code, Zap } from "lucide-react";

// Get node styling based on type
const getNodeStyle = (type: string) => {
  const nodeType = type?.toLowerCase() || "";

  if (nodeType.includes("trigger") || nodeType.includes("webhook")) {
    return {
      bgColor: "bg-primary/10",
      borderColor: "border-primary",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
    };
  }

  if (nodeType.includes("http") || nodeType.includes("request")) {
    return {
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-500",
    };
  }

  if (nodeType.includes("database") || nodeType.includes("sql")) {
    return {
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500",
      iconBg: "bg-green-500/20",
      iconColor: "text-green-500",
    };
  }

  if (nodeType.includes("email") || nodeType.includes("mail")) {
    return {
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500",
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-500",
    };
  }

  if (nodeType.includes("code") || nodeType.includes("function")) {
    return {
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500",
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-500",
    };
  }

  // Default styling
  return {
    bgColor: "bg-background",
    borderColor: "border-border",
    iconBg: "bg-muted",
    iconColor: "text-foreground",
  };
};

// Custom node component that looks like n8n
const CustomNode = ({ data }: { data: any }) => {
  const getNodeIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      trigger: Activity,
      http: Globe,
      webhook: Zap,
      database: Database,
      email: Mail,
      code: Code,
      default: Activity,
    };

    const nodeType = type?.toLowerCase() || "";
    for (const [key, Icon] of Object.entries(iconMap)) {
      if (nodeType.includes(key)) {
        return <Icon className="w-5 h-5" />;
      }
    }
    return <iconMap.default className="w-5 h-5" />;
  };

  const style = data.disabled
    ? {
        bgColor: "bg-muted",
        borderColor: "border-muted-foreground",
        iconBg: "bg-muted-foreground/20",
        iconColor: "text-muted-foreground",
      }
    : getNodeStyle(data.type);

  return (
    <div
      className={`px-4 py-3 border-2 ${style.borderColor} ${style.bgColor} min-w-[180px] hover:border-primary transition-all duration-200 shadow-sm hover:shadow-md relative`}
    >
      {/* Input Handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 bg-background"
        style={{
          borderColor: style.borderColor.includes("primary")
            ? "hsl(var(--primary))"
            : style.borderColor.includes("blue")
            ? "rgb(59, 130, 246)"
            : style.borderColor.includes("green")
            ? "rgb(34, 197, 94)"
            : style.borderColor.includes("purple")
            ? "rgb(168, 85, 247)"
            : style.borderColor.includes("orange")
            ? "rgb(249, 115, 22)"
            : "hsl(var(--border))",
        }}
      />

      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 border-2 ${style.borderColor} ${style.iconBg} ${style.iconColor} flex items-center justify-center`}>
          {getNodeIcon(data.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono font-bold text-sm text-foreground truncate">
            {data.label || data.name || "Node"}
          </div>
          <div className="font-mono text-xs text-muted-foreground truncate">
            {data.type || "node"}
          </div>
        </div>
      </div>
      {data.notes && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="font-mono text-xs text-muted-foreground line-clamp-2">
            {data.notes}
          </div>
        </div>
      )}

      {/* Output Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 bg-background"
        style={{
          borderColor: style.borderColor.includes("primary")
            ? "hsl(var(--primary))"
            : style.borderColor.includes("blue")
            ? "rgb(59, 130, 246)"
            : style.borderColor.includes("green")
            ? "rgb(34, 197, 94)"
            : style.borderColor.includes("purple")
            ? "rgb(168, 85, 247)"
            : style.borderColor.includes("orange")
            ? "rgb(249, 115, 22)"
            : "hsl(var(--border))",
        }}
      />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

interface WorkflowVisualizerProps {
  workflowJson: any;
  className?: string;
  miniMode?: boolean;
}

export default function WorkflowVisualizer({
  workflowJson,
  className = "",
  miniMode = false,
}: WorkflowVisualizerProps) {
  // Parse n8n workflow JSON and convert to React Flow format
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!workflowJson || !workflowJson.nodes) {
      return { initialNodes: [], initialEdges: [] };
    }

    const nodes: Node[] = workflowJson.nodes.map((node: any, index: number) => {
      const position = node.position || [index * 350, index * 150];

      return {
        id: node.name || `node-${index}`,
        type: "custom",
        position: {
          x: Array.isArray(position) ? position[0] : position.x || index * 350,
          y: Array.isArray(position) ? position[1] : position.y || index * 150,
        },
        data: {
          label: node.name,
          type: node.type,
          notes: node.notes,
          disabled: node.disabled,
          parameters: node.parameters,
        },
      };
    });

    const edges: Edge[] = [];

    // Parse connections from n8n format
    if (workflowJson.connections) {
      Object.keys(workflowJson.connections).forEach((sourceNode) => {
        const connections = workflowJson.connections[sourceNode];

        Object.keys(connections).forEach((outputType) => {
          const outputs = connections[outputType];

          outputs.forEach((outputConnections: any[], outputIndex: number) => {
            outputConnections.forEach((connection: any, connIndex: number) => {
              edges.push({
                id: `${sourceNode}-${connection.node}-${outputIndex}-${connIndex}`,
                source: sourceNode,
                target: connection.node,
                type: "smoothstep",
                animated: true,
                style: {
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 2,
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: "hsl(var(--primary))",
                  width: 20,
                  height: 20,
                },
              });
            });
          });
        });
      });
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [workflowJson]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const height = miniMode ? "300px" : "600px";

  if (!workflowJson || !workflowJson.nodes || workflowJson.nodes.length === 0) {
    return (
      <div
        className={`border-2 border-border bg-muted/30 flex items-center justify-center font-mono text-muted-foreground ${className}`}
        style={{ height }}
      >
        NO WORKFLOW DATA AVAILABLE
      </div>
    );
  }

  return (
    <div className={`border-2 border-border bg-background ${className}`} style={{ height }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.3,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        attributionPosition="bottom-left"
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
          style: {
            stroke: "hsl(var(--primary))",
            strokeWidth: 2,
          },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="hsl(var(--border))"
        />
        {!miniMode && (
          <>
            <Controls
              className="border-2 border-border bg-background [&_button]:font-mono"
              showInteractive={false}
            />
            <MiniMap
              className="border-2 border-border bg-background"
              nodeColor={(node) => {
                const type = node.data?.type?.toLowerCase() || "";
                if (type.includes("trigger")) return "hsl(var(--primary))";
                if (type.includes("http")) return "rgb(59, 130, 246)";
                if (type.includes("database")) return "rgb(34, 197, 94)";
                if (type.includes("email")) return "rgb(168, 85, 247)";
                if (type.includes("code")) return "rgb(249, 115, 22)";
                return "hsl(var(--muted-foreground))";
              }}
              maskColor="hsl(var(--muted) / 0.8)"
              style={{
                backgroundColor: "hsl(var(--background))",
              }}
            />
            <Panel position="top-left" className="bg-background border-2 border-border p-2">
              <div className="font-mono text-xs font-bold text-foreground uppercase">
                WORKFLOW PREVIEW
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {nodes.length} nodes • {edges.length} connections
              </div>
            </Panel>
          </>
        )}
      </ReactFlow>
    </div>
  );
}
