"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Send, TestTube, FileText, Users, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner"

type Stats = {
  totalUsers: number
  accessedUsers: number
  pendingUsers: number
  recentSignups: {
    email: string
    hasAccessed: boolean
    createdAt: Date
    accessedAt: Date | null
  }[]
}

export default function EmailManagement({ stats }: { stats: Stats }) {
  const [testEmail, setTestEmail] = useState("")
  const [testLoading, setTestLoading] = useState(false)

  const [announcementSubject, setAnnouncementSubject] = useState("")
  const [announcementMessage, setAnnouncementMessage] = useState("")
  const [announcementLoading, setAnnouncementLoading] = useState(false)
  const [sendTo, setSendTo] = useState<"all" | "accessed" | "pending">("all")

  // Test Email Sending
  const handleTestEmail = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      toast.error("Please enter a valid email")
      return
    }

    setTestLoading(true)

    try {
      const response = await fetch("/api/admin/emails/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send test email")
      }

      toast.success("Test email sent successfully!")
      setTestEmail("")
    } catch (error: any) {
      toast.error(error.message || "Failed to send test email")
    } finally {
      setTestLoading(false)
    }
  }

  // Send Announcement
  const handleSendAnnouncement = async () => {
    if (!announcementSubject || !announcementMessage) {
      toast.error("Please fill in both subject and message")
      return
    }

    const recipientCount = sendTo === "all" ? stats.totalUsers
      : sendTo === "accessed" ? stats.accessedUsers
      : stats.pendingUsers

    if (recipientCount === 0) {
      toast.error("No recipients to send to")
      return
    }

    const confirmed = window.confirm(
      `Send announcement to ${recipientCount} users (${sendTo})?\n\nThis action cannot be undone.`
    )

    if (!confirmed) return

    setAnnouncementLoading(true)

    try {
      const response = await fetch("/api/admin/emails/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: announcementSubject,
          message: announcementMessage,
          sendTo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send announcement")
      }

      toast.success(`Announcement sent to ${data.sent} users!`)
      setAnnouncementSubject("")
      setAnnouncementMessage("")
    } catch (error: any) {
      toast.error(error.message || "Failed to send announcement")
    } finally {
      setAnnouncementLoading(false)
    }
  }

  return (
    <Tabs defaultValue="test" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="test" className="font-mono">
          <TestTube className="h-4 w-4 mr-2" />
          Test Email
        </TabsTrigger>
        <TabsTrigger value="announcement" className="font-mono">
          <Send className="h-4 w-4 mr-2" />
          Announcement
        </TabsTrigger>
        <TabsTrigger value="templates" className="font-mono">
          <FileText className="h-4 w-4 mr-2" />
          Templates
        </TabsTrigger>
        <TabsTrigger value="users" className="font-mono">
          <Users className="h-4 w-4 mr-2" />
          Recent Users
        </TabsTrigger>
      </TabsList>

      {/* Test Email Tab */}
      <TabsContent value="test" className="space-y-4">
        <Card className="p-6 border-2">
          <h3 className="text-xl font-mono font-bold mb-4">TEST EMAIL DELIVERY</h3>
          <p className="text-sm text-muted-foreground font-mono mb-6">
            Send a test email to verify your Resend configuration is working correctly.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="testEmail" className="font-mono">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="font-mono"
              />
            </div>

            <Button
              onClick={handleTestEmail}
              disabled={testLoading}
              className="w-full font-mono"
            >
              {testLoading ? (
                <>Sending Test Email...</>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 border-2 border-dashed">
            <p className="text-xs font-mono text-muted-foreground">
              <strong>Note:</strong> The test email will be sent using the FlowKit access code template.
              Check your inbox (and spam folder) to verify delivery.
            </p>
          </div>
        </Card>
      </TabsContent>

      {/* Announcement Tab */}
      <TabsContent value="announcement" className="space-y-4">
        <Card className="p-6 border-2">
          <h3 className="text-xl font-mono font-bold mb-4">SEND ANNOUNCEMENT</h3>
          <p className="text-sm text-muted-foreground font-mono mb-6">
            Send a broadcast email to all users, only accessed users, or only pending users.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="sendTo" className="font-mono">Send To</Label>
              <select
                id="sendTo"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value as typeof sendTo)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              >
                <option value="all">All Users ({stats.totalUsers})</option>
                <option value="accessed">Accessed Users ({stats.accessedUsers})</option>
                <option value="pending">Pending Users ({stats.pendingUsers})</option>
              </select>
            </div>

            <div>
              <Label htmlFor="subject" className="font-mono">Subject</Label>
              <Input
                id="subject"
                type="text"
                value={announcementSubject}
                onChange={(e) => setAnnouncementSubject(e.target.value)}
                placeholder="Your announcement subject"
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="message" className="font-mono">Message</Label>
              <Textarea
                id="message"
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                placeholder="Your announcement message..."
                className="font-mono min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                This will be sent as plain text. HTML formatting is not supported yet.
              </p>
            </div>

            <Button
              onClick={handleSendAnnouncement}
              disabled={announcementLoading}
              className="w-full font-mono"
              variant="default"
            >
              {announcementLoading ? (
                <>Sending Announcement...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Announcement
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-destructive/10 border-2 border-destructive/50">
            <p className="text-xs font-mono text-destructive-foreground">
              <strong>⚠️ Warning:</strong> This will send emails to real users. Make sure your message is correct before sending.
              This action cannot be undone.
            </p>
          </div>
        </Card>
      </TabsContent>

      {/* Templates Tab */}
      <TabsContent value="templates" className="space-y-4">
        <Card className="p-6 border-2">
          <h3 className="text-xl font-mono font-bold mb-4">EMAIL TEMPLATES</h3>
          <p className="text-sm text-muted-foreground font-mono mb-6">
            View and manage email templates used by FlowKit.
          </p>

          <div className="space-y-4">
            {/* Access Code Template */}
            <div className="border-2 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-mono font-bold">Access Code Email</h4>
                <span className="text-xs font-mono text-muted-foreground">DEFAULT</span>
              </div>
              <p className="text-sm text-muted-foreground font-mono mb-3">
                Sent when users request access to FlowKit with their 6-digit code.
              </p>
              <div className="bg-muted/50 p-3 rounded font-mono text-xs">
                <div className="font-bold mb-1">Subject:</div>
                <div className="mb-3">Your FlowKit Access Code 🔑</div>
                <div className="font-bold mb-1">Template Location:</div>
                <div className="text-primary">src/lib/resend.ts</div>
              </div>
            </div>

            {/* Announcement Template */}
            <div className="border-2 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-mono font-bold">Announcement Email</h4>
                <span className="text-xs font-mono text-muted-foreground">CUSTOM</span>
              </div>
              <p className="text-sm text-muted-foreground font-mono mb-3">
                Used for broadcasting announcements to users.
              </p>
              <div className="bg-muted/50 p-3 rounded font-mono text-xs">
                <div className="font-bold mb-1">Features:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Custom subject line</li>
                  <li>Plain text message</li>
                  <li>FlowKit branding</li>
                </ul>
              </div>
            </div>

            {/* Test Email Template */}
            <div className="border-2 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-mono font-bold">Test Email</h4>
                <span className="text-xs font-mono text-muted-foreground">SYSTEM</span>
              </div>
              <p className="text-sm text-muted-foreground font-mono mb-3">
                Simple test email to verify Resend configuration.
              </p>
              <div className="bg-muted/50 p-3 rounded font-mono text-xs">
                <div className="font-bold mb-1">Purpose:</div>
                <div>Verify email delivery is working correctly</div>
              </div>
            </div>
          </div>
        </Card>
      </TabsContent>

      {/* Recent Users Tab */}
      <TabsContent value="users" className="space-y-4">
        <Card className="p-6 border-2">
          <h3 className="text-xl font-mono font-bold mb-4">RECENT SIGNUPS</h3>
          <p className="text-sm text-muted-foreground font-mono mb-6">
            Latest users who joined the waitlist.
          </p>

          <div className="space-y-2">
            {stats.recentSignups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground font-mono text-sm">
                No signups yet
              </div>
            ) : (
              stats.recentSignups.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${user.hasAccessed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <div>
                      <div className="font-mono text-sm">{user.email}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        Signed up: {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.hasAccessed ? (
                      <span className="text-xs font-mono text-green-500 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Accessed
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-yellow-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
