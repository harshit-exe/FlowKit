import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Comprehensive list of n8n official nodes
const OFFICIAL_N8N_NODES = [
  // CORE NODES
  {
    name: "Activation Trigger",
    type: "n8n-nodes-base.activationTrigger",
    category: "Trigger",
    description: "Trigger that activates when workflow is enabled",
    icon: "fa:play-circle",
    parameters: {},
    credentials: [],
  },
  {
    name: "Aggregate",
    type: "n8n-nodes-base.aggregate",
    category: "Core",
    description: "Combines multiple items into aggregated data",
    icon: "fa:object-group",
    parameters: {},
    credentials: [],
  },
  {
    name: "AI Transform",
    type: "n8n-nodes-base.aiTransform",
    category: "Core",
    description: "Transforms data using AI capabilities",
    icon: "fa:robot",
    parameters: {},
    credentials: [],
  },
  {
    name: "Code",
    type: "n8n-nodes-base.code",
    category: "Core",
    description: "Execute custom JavaScript code within workflows",
    icon: "fa:code",
    parameters: { mode: ["runOnceForAllItems", "runOnceForEachItem"] },
    credentials: [],
  },
  {
    name: "HTTP Request",
    type: "n8n-nodes-base.httpRequest",
    category: "Core",
    description: "Makes HTTP/REST API requests to any URL",
    icon: "fa:globe",
    parameters: {
      method: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
      url: "string",
      authentication: ["none", "basicAuth", "oAuth2", "customAuth"],
    },
    credentials: ["httpBasicAuth", "oAuth2Api"],
  },
  {
    name: "Webhook",
    type: "n8n-nodes-base.webhook",
    category: "Trigger",
    description: "Receives HTTP requests as workflow triggers",
    icon: "fa:arrow-down",
    parameters: {
      path: "string",
      httpMethod: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    },
    credentials: [],
  },
  {
    name: "Schedule Trigger",
    type: "n8n-nodes-base.scheduleTrigger",
    category: "Trigger",
    description: "Runs workflow on defined schedule (cron)",
    icon: "fa:clock",
    parameters: { cronExpression: "string", triggerTimes: "array" },
    credentials: [],
  },
  {
    name: "Manual Trigger",
    type: "n8n-nodes-base.manualTrigger",
    category: "Trigger",
    description: "Manually triggers workflow execution via UI",
    icon: "fa:hand-pointer",
    parameters: {},
    credentials: [],
  },
  {
    name: "Edit Fields (Set)",
    type: "n8n-nodes-base.set",
    category: "Core",
    description: "Sets or modifies field values in data items",
    icon: "fa:edit",
    parameters: { values: "object" },
    credentials: [],
  },
  {
    name: "If",
    type: "n8n-nodes-base.if",
    category: "Core",
    description: "Branching logic based on conditions",
    icon: "fa:code-branch",
    parameters: { conditions: "array" },
    credentials: [],
  },
  {
    name: "Switch",
    type: "n8n-nodes-base.switch",
    category: "Core",
    description: "Routes data based on multiple conditions",
    icon: "fa:random",
    parameters: { rules: "array" },
    credentials: [],
  },
  {
    name: "Merge",
    type: "n8n-nodes-base.merge",
    category: "Core",
    description: "Merges data from multiple inputs",
    icon: "fa:clone",
    parameters: { mode: ["append", "merge", "multiplex"] },
    credentials: [],
  },
  {
    name: "Filter",
    type: "n8n-nodes-base.filter",
    category: "Core",
    description: "Filters items based on conditions",
    icon: "fa:filter",
    parameters: { conditions: "array" },
    credentials: [],
  },
  {
    name: "Send Email",
    type: "n8n-nodes-base.emailSend",
    category: "Core",
    description: "Sends emails via SMTP",
    icon: "fa:envelope",
    parameters: { fromEmail: "string", toEmail: "string", subject: "string" },
    credentials: ["smtp"],
  },
  {
    name: "Split Out",
    type: "n8n-nodes-base.splitOut",
    category: "Core",
    description: "Splits single item into multiple items",
    icon: "fa:sitemap",
    parameters: {},
    credentials: [],
  },
  {
    name: "Respond to Webhook",
    type: "n8n-nodes-base.respondToWebhook",
    category: "Core",
    description: "Sends HTTP response to webhook requests",
    icon: "fa:arrow-up",
    parameters: { respondWith: "string" },
    credentials: [],
  },

  // INTEGRATION NODES - Popular Services
  {
    name: "Google Sheets",
    type: "n8n-nodes-base.googleSheets",
    category: "Integration",
    description: "Read, write, and update Google Sheets data",
    icon: "file:googleSheets.svg",
    parameters: {
      operation: ["append", "read", "update", "delete", "lookup", "clear"],
      sheetId: "string",
    },
    credentials: ["googleSheetsOAuth2"],
  },
  {
    name: "Gmail",
    type: "n8n-nodes-base.gmail",
    category: "Integration",
    description: "Send, read, and manage Gmail messages",
    icon: "file:gmail.svg",
    parameters: {
      operation: ["send", "get", "getAll", "delete", "addLabels"],
    },
    credentials: ["gmailOAuth2"],
  },
  {
    name: "Slack",
    type: "n8n-nodes-base.slack",
    category: "Integration",
    description: "Send messages and interact with Slack workspace",
    icon: "file:slack.svg",
    parameters: {
      resource: ["message", "channel", "user"],
      operation: ["post", "update", "delete"],
    },
    credentials: ["slackOAuth2", "slackApi"],
  },
  {
    name: "Notion",
    type: "n8n-nodes-base.notion",
    category: "Integration",
    description: "Create and update Notion pages and databases",
    icon: "file:notion.svg",
    parameters: {
      resource: ["page", "database", "block"],
      operation: ["create", "get", "update", "delete"],
    },
    credentials: ["notionOAuth2", "notionApi"],
  },
  {
    name: "Airtable",
    type: "n8n-nodes-base.airtable",
    category: "Integration",
    description: "Access and modify Airtable bases",
    icon: "file:airtable.svg",
    parameters: {
      operation: ["create", "read", "update", "delete", "list"],
      baseId: "string",
    },
    credentials: ["airtableApi"],
  },
  {
    name: "Discord",
    type: "n8n-nodes-base.discord",
    category: "Integration",
    description: "Send messages to Discord channels",
    icon: "file:discord.svg",
    parameters: { webhookUrl: "string", content: "string" },
    credentials: [],
  },
  {
    name: "Telegram",
    type: "n8n-nodes-base.telegram",
    category: "Integration",
    description: "Send and receive Telegram messages",
    icon: "file:telegram.svg",
    parameters: {
      operation: ["sendMessage", "editMessage", "deleteMessage"],
      chatId: "string",
    },
    credentials: ["telegramApi"],
  },
  {
    name: "Twitter",
    type: "n8n-nodes-base.twitter",
    category: "Integration",
    description: "Post tweets and interact with Twitter API",
    icon: "file:twitter.svg",
    parameters: { operation: ["tweet", "retweet", "like", "search"] },
    credentials: ["twitterOAuth1"],
  },
  {
    name: "GitHub",
    type: "n8n-nodes-base.github",
    category: "Integration",
    description: "Interact with GitHub repositories and issues",
    icon: "file:github.svg",
    parameters: {
      resource: ["issue", "repository", "user"],
      operation: ["create", "get", "update", "delete"],
    },
    credentials: ["githubOAuth2", "githubApi"],
  },
  {
    name: "MySQL",
    type: "n8n-nodes-base.mySql",
    category: "Database",
    description: "Execute SQL queries on MySQL databases",
    icon: "file:mysql.svg",
    parameters: { operation: ["execute", "insert", "update", "delete"] },
    credentials: ["mySql"],
  },
  {
    name: "PostgreSQL",
    type: "n8n-nodes-base.postgres",
    category: "Database",
    description: "Execute SQL queries on PostgreSQL databases",
    icon: "file:postgres.svg",
    parameters: { operation: ["execute", "insert", "update", "delete"] },
    credentials: ["postgres"],
  },
  {
    name: "MongoDB",
    type: "n8n-nodes-base.mongoDb",
    category: "Database",
    description: "Interact with MongoDB collections",
    icon: "file:mongodb.svg",
    parameters: {
      operation: ["find", "insert", "update", "delete", "aggregate"],
    },
    credentials: ["mongoDb"],
  },
  {
    name: "Stripe",
    type: "n8n-nodes-base.stripe",
    category: "Integration",
    description: "Process payments and manage Stripe data",
    icon: "file:stripe.svg",
    parameters: {
      resource: ["charge", "customer", "subscription"],
      operation: ["create", "get", "update", "delete"],
    },
    credentials: ["stripeApi"],
  },
  {
    name: "HubSpot",
    type: "n8n-nodes-base.hubspot",
    category: "Integration",
    description: "Manage HubSpot CRM contacts and deals",
    icon: "file:hubspot.svg",
    parameters: {
      resource: ["contact", "company", "deal"],
      operation: ["create", "get", "update", "delete"],
    },
    credentials: ["hubspotOAuth2", "hubspotApi"],
  },
  {
    name: "RSS Feed Read",
    type: "n8n-nodes-base.rssFeedRead",
    category: "Integration",
    description: "Reads and parses RSS feed content",
    icon: "fa:rss",
    parameters: { url: "string" },
    credentials: [],
  },
  {
    name: "RSS Feed Trigger",
    type: "n8n-nodes-base.rssFeedTrigger",
    category: "Trigger",
    description: "Triggers when RSS feed updates",
    icon: "fa:rss-square",
    parameters: { url: "string" },
    credentials: [],
  },
  {
    name: "Date & Time",
    type: "n8n-nodes-base.dateTime",
    category: "Core",
    description: "Manipulates and formats date/time values",
    icon: "fa:calendar",
    parameters: {},
    credentials: [],
  },
  {
    name: "Wait",
    type: "n8n-nodes-base.wait",
    category: "Core",
    description: "Pauses workflow execution for duration",
    icon: "fa:pause-circle",
    parameters: { amount: "number", unit: ["seconds", "minutes", "hours"] },
    credentials: [],
  },
];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[SEED_NODES] Starting seed process...");

    // Clear existing nodes (optional - comment out if you want to keep existing)
    await prisma.n8nNode.deleteMany({});
    console.log("[SEED_NODES] Cleared existing nodes");

    // Seed nodes one by one to catch errors
    const nodes = [];
    for (const node of OFFICIAL_N8N_NODES) {
      try {
        const createdNode = await prisma.n8nNode.create({
          data: {
            name: node.name,
            type: node.type,
            category: node.category,
            description: node.description,
            icon: node.icon || null,
            parameters: node.parameters as any,
            credentials: node.credentials as any,
            isPremium: false,
            isDeprecated: false,
            docUrl: `https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.${node.type.split(".").pop()}/`,
          },
        });
        nodes.push(createdNode);
        console.log(`[SEED_NODES] Created node: ${node.name}`);
      } catch (error) {
        console.error(`[SEED_NODES] Error creating node ${node.name}:`, error);
        throw error;
      }
    }

    console.log(`[SEED_NODES] Successfully seeded ${nodes.length} nodes`);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${nodes.length} n8n nodes`,
      count: nodes.length,
    });
  } catch (error: any) {
    console.error("[SEED_NODES] Error:", error);
    console.error("[SEED_NODES] Error message:", error.message);
    console.error("[SEED_NODES] Error stack:", error.stack);
    return NextResponse.json(
      { error: error.message || "Failed to seed nodes" },
      { status: 500 }
    );
  }
}
