"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Database,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface N8nNode {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  icon: string | null;
  isPremium: boolean;
  isDeprecated: boolean;
  createdAt: string;
}

export default function AdminNodesPage() {
  const [nodes, setNodes] = useState<N8nNode[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<N8nNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchNodes();
  }, []);

  useEffect(() => {
    filterNodes();
  }, [nodes, searchQuery, categoryFilter]);

  const fetchNodes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/nodes");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch nodes");
      }

      setNodes(data.nodes);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to fetch nodes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedNodes = async () => {
    setIsSeeding(true);
    try {
      const response = await fetch("/api/admin/nodes/seed", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to seed nodes");
      }

      toast.success(`Successfully seeded ${data.count} nodes!`);
      fetchNodes();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to seed nodes");
    } finally {
      setIsSeeding(false);
    }
  };

  const filterNodes = () => {
    let filtered = [...nodes];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (node) =>
          node.name.toLowerCase().includes(query) ||
          node.type.toLowerCase().includes(query) ||
          node.description.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((node) => node.category === categoryFilter);
    }

    setFilteredNodes(filtered);
  };

  const categories = Array.from(new Set(nodes.map((node) => node.category)));

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Core: "bg-blue-500",
      Trigger: "bg-green-500",
      Integration: "bg-purple-500",
      Database: "bg-orange-500",
    };
    return colors[category] || "bg-gray-500";
  };

  const stats = {
    total: nodes.length,
    core: nodes.filter((n) => n.category === "Core").length,
    trigger: nodes.filter((n) => n.category === "Trigger").length,
    integration: nodes.filter((n) => n.category === "Integration").length,
    database: nodes.filter((n) => n.category === "Database").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-mono uppercase tracking-tight">
            N8N NODES MANAGEMENT
          </h1>
          <p className="text-muted-foreground font-mono mt-1">
            Manage official n8n node types for AI workflow builder
          </p>
        </div>
        <Button
          onClick={handleSeedNodes}
          disabled={isSeeding}
          className="font-mono font-bold"
        >
          {isSeeding ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              SEEDING...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              SEED NODES
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-2 font-mono">
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground uppercase mt-1">
              TOTAL NODES
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 font-mono">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-500">{stats.core}</div>
            <p className="text-xs text-muted-foreground uppercase mt-1">
              CORE NODES
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 font-mono">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-500">
              {stats.trigger}
            </div>
            <p className="text-xs text-muted-foreground uppercase mt-1">
              TRIGGER NODES
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 font-mono">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-500">
              {stats.integration}
            </div>
            <p className="text-xs text-muted-foreground uppercase mt-1">
              INTEGRATION NODES
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 font-mono">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-500">
              {stats.database}
            </div>
            <p className="text-xs text-muted-foreground uppercase mt-1">
              DATABASE NODES
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2 font-mono">
        <CardHeader>
          <CardTitle className="font-mono uppercase tracking-wider">
            FILTER NODES
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, type, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-mono border-2"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 font-mono border-2">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-mono">
                  ALL CATEGORIES
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                    className="font-mono"
                  >
                    {category.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={fetchNodes}
              className="font-mono border-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              REFRESH
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Nodes Table */}
      <Card className="border-2 font-mono">
        <CardHeader>
          <CardTitle className="font-mono uppercase tracking-wider">
            NODES LIST ({filteredNodes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredNodes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-mono">
                {nodes.length === 0
                  ? "NO NODES FOUND. CLICK 'SEED NODES' TO POPULATE."
                  : "NO NODES MATCH YOUR FILTERS."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="font-mono">
                    <TableHead className="font-mono uppercase">NAME</TableHead>
                    <TableHead className="font-mono uppercase">TYPE</TableHead>
                    <TableHead className="font-mono uppercase">
                      CATEGORY
                    </TableHead>
                    <TableHead className="font-mono uppercase">
                      DESCRIPTION
                    </TableHead>
                    <TableHead className="font-mono uppercase">
                      STATUS
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNodes.map((node) => (
                    <TableRow key={node.id} className="font-mono">
                      <TableCell className="font-semibold">
                        {node.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {node.type}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getCategoryColor(
                            node.category
                          )} text-white font-mono`}
                        >
                          {node.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-md truncate">
                        {node.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {node.isDeprecated ? (
                            <Badge
                              variant="destructive"
                              className="font-mono text-xs"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              DEPRECATED
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="font-mono text-xs border-2 border-green-500 text-green-500"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              ACTIVE
                            </Badge>
                          )}
                          {node.isPremium && (
                            <Badge
                              variant="secondary"
                              className="font-mono text-xs"
                            >
                              PREMIUM
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
