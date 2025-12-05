"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, Mail, ArrowRight, Loader2, Check, Monitor, Sparkles, Users, Zap, Shield, Code2, Eye, TrendingUp, Star, Laptop } from "lucide-react"
import { toast } from "sonner"

export default function AccessGate() {
  const [step, setStep] = useState<"email" | "code">("email")
  const [email, setEmail] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [waitlistCount, setWaitlistCount] = useState(0)
  const [accessedCount, setAccessedCount] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if user has valid access in sessionStorage
    const hasAccess = sessionStorage.getItem("flowkit_access")
    if (hasAccess === "true") {
      window.location.reload()
    }

    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Fetch waitlist stats
    fetch("/api/waitlist/count")
      .then(res => res.json())
      .then(data => {
        setWaitlistCount(data.count || 0)
        setAccessedCount(Math.floor((data.count || 0) * 0.65))
      })
      .catch(() => {})

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/waitlist/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      toast.success("Access code sent! Check your inbox.")
      setStep("code")
      setWaitlistCount(prev => prev + 1)
    } catch (error: any) {
      toast.error(error.message || "Failed to send access code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (accessCode.length !== 6) {
      toast.error("Access code must be 6 digits")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/waitlist/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, accessCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Invalid access code")
      }

      toast.success("Access granted! Welcome to FlowKit.")
      sessionStorage.setItem("flowkit_access", "true")

      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error: any) {
      toast.error(error.message || "Invalid access code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeInput = (value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 6)
    setAccessCode(sanitized)
  }

  if (!mounted) return null

  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] bg-black overflow-hidden">
      {/* Animated Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/grid.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '112px 112px',
          opacity: 0.2,
          animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-primary/5" />

      {/* Decorative Corner Elements */}
      <div className="absolute top-0 left-0 w-20 lg:w-28 h-20 lg:h-28 border-l-2 border-t-2 border-primary/20" />
      <div className="absolute top-0 right-0 w-20 lg:w-28 h-20 lg:h-28 border-r-2 border-t-2 border-primary/20" />
      <div className="absolute bottom-0 left-0 w-20 lg:w-28 h-20 lg:h-28 border-l-2 border-b-2 border-primary/20" />
      <div className="absolute bottom-0 right-0 w-20 lg:w-28 h-20 lg:h-28 border-r-2 border-b-2 border-primary/20" />

      {/* Mobile Motivational Banner */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 border-b-2 border-primary bg-gradient-to-r from-black via-primary/10 to-black backdrop-blur-xl z-50 shadow-[0_10px_40px_rgba(255,102,51,0.2)]">
          <div className="px-3 py-3">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 border-2 border-primary bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 relative">
                <div className="absolute inset-0 bg-primary/30 animate-pulse" />
                <Laptop className="h-4 w-4 text-primary relative z-10" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-primary font-mono font-bold text-[11px] tracking-wider mb-0.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 inline" />
                  THIS DESERVES A BIGGER SCREEN
                </div>
                <div className="text-white/90 font-mono text-[10px] leading-tight">
                  We designed this for 27-inch monitors and espresso machines. The full power, the real magic—it all happens on desktop. Trust us, it's worth firing up the laptop.
                </div>
                <div className="mt-1 text-primary/80 font-mono text-[9px] italic">
                  (But fine, you can proceed here if you're stubborn.)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container - Perfectly centered, no scroll */}
      <div className={`relative h-full w-full flex flex-col items-center ${isMobile ? 'justify-start pt-[88px] px-3' : 'justify-center px-6'} overflow-hidden`}>
        {/* Stats Bar - Top on desktop, compact */}
        {!isMobile && (
          <div className="w-full max-w-4xl mb-6">
            <div className="grid grid-cols-3 gap-3">
              {/* Total Builders */}
              <div className="border-2 border-primary/30 bg-black/80 backdrop-blur-xl p-3 relative overflow-hidden group hover:border-primary/50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-2">
                  <div className="w-8 h-8 border-2 border-primary bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xl font-mono font-bold text-primary tabular-nums leading-none">
                      {waitlistCount.toString().padStart(3, '0')}
                    </div>
                    <div className="text-[9px] font-mono text-muted-foreground tracking-wider mt-0.5">
                      BUILDERS WAITING
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Granted */}
              <div className="border-2 border-primary/30 bg-black/80 backdrop-blur-xl p-3 relative overflow-hidden group hover:border-primary/50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-2">
                  <div className="w-8 h-8 border-2 border-green-500 bg-green-500/10 flex items-center justify-center shrink-0">
                    <Eye className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xl font-mono font-bold text-green-500 tabular-nums leading-none">
                      {accessedCount.toString().padStart(3, '0')}
                    </div>
                    <div className="text-[9px] font-mono text-muted-foreground tracking-wider mt-0.5">
                      ALREADY INSIDE
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Indicator */}
              <div className="border-2 border-primary/30 bg-black/80 backdrop-blur-xl p-3 relative overflow-hidden group hover:border-primary/50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-2">
                  <div className="w-8 h-8 border-2 border-primary bg-primary/10 flex items-center justify-center relative shrink-0">
                    <div className="absolute inset-0 bg-primary/20 animate-ping" />
                    <TrendingUp className="h-4 w-4 text-primary relative z-10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xl font-mono font-bold text-white leading-none">LIVE</div>
                    <div className="text-[9px] font-mono text-muted-foreground tracking-wider mt-0.5">
                      SYSTEM STATUS
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Access Card */}
        <div className="w-full max-w-2xl flex-shrink-0">
          {/* Brand Header - Compact */}
          <div className={`text-center ${isMobile ? 'mb-3' : 'mb-5'} relative`}>
            <div className={`inline-flex items-center justify-center ${isMobile ? 'w-14 h-14' : 'w-20 h-20'} border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5 ${isMobile ? 'mb-2' : 'mb-4'} relative group`}>
              <div className="absolute inset-0 bg-primary/20 animate-pulse" />
              <Lock className={`${isMobile ? 'h-7 w-7' : 'h-10 w-10'} text-primary relative z-10 group-hover:scale-110 transition-transform`} />
              <Sparkles className={`absolute ${isMobile ? '-top-1 -right-1 h-3 w-3' : '-top-1.5 -right-1.5 h-5 w-5'} text-primary animate-pulse`} />
            </div>

            <h1 className={`${isMobile ? 'text-3xl mb-2' : 'text-5xl mb-3'} font-mono font-bold tracking-tight`}>
              <span className="bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent">
                FLOWKIT
              </span>
            </h1>

            <div className={`inline-flex items-center gap-2 rounded-full border border-primary/40 bg-gradient-to-r from-primary/10 to-primary/5 ${isMobile ? 'px-3 py-1' : 'px-5 py-1.5'} ${isMobile ? 'text-[10px]' : 'text-[11px]'} text-primary font-mono font-bold tracking-wider backdrop-blur-sm shadow-[0_0_20px_rgba(255,102,51,0.15)]`}>
              <Star className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'} fill-primary`} />
              EXCLUSIVE EARLY ACCESS
              <Star className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'} fill-primary`} />
            </div>

            {!isMobile && (
              <p className="mt-2 text-xs font-mono text-muted-foreground">
                Where precision meets automation
              </p>
            )}
          </div>

          {/* Access Form Card - Compact */}
          <div className="border-2 border-primary/40 bg-black/90 backdrop-blur-xl relative overflow-hidden shadow-[0_0_50px_rgba(255,102,51,0.1)]">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary" />

            <div className={`${isMobile ? 'p-4' : 'p-8'} relative z-10`}>
              {step === "email" ? (
                <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
                  {/* Header */}
                  <div className={isMobile ? 'space-y-2' : 'space-y-2.5'}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                      <Zap className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-primary`} />
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    </div>

                    <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-mono font-bold text-center tracking-tight leading-none`}>
                      {isMobile ? "ALMOST READY" : "THE WAIT IS ALMOST OVER"}
                    </h2>

                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-center text-white/80 font-mono leading-relaxed`}>
                      {isMobile
                        ? "Automation that thinks like you do. Drop your email, get instant access."
                        : "We're crafting something that doesn't just automate workflows—it transforms how you think about them. Clean. Powerful. Unapologetically precise."
                      }
                    </p>
                  </div>

                  {/* Email Form */}
                  <form onSubmit={handleEmailSubmit} className={isMobile ? 'space-y-3' : 'space-y-4'}>
                    <div>
                      <label className={`block ${isMobile ? 'text-[10px]' : 'text-[11px]'} font-mono font-bold ${isMobile ? 'mb-2' : 'mb-2'} text-primary tracking-widest flex items-center gap-1.5`}>
                        <Mail className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
                        YOUR EMAIL ADDRESS
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-none opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="architect@company.com"
                          className={`relative ${isMobile ? 'h-11 text-sm' : 'h-12 text-sm'} border-2 border-primary/30 bg-black/50 font-mono rounded-none focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 transition-all`}
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full ${isMobile ? 'h-11 text-xs' : 'h-12 text-sm'} rounded-none bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary font-mono font-bold tracking-wider shadow-[0_0_30px_rgba(255,102,51,0.3)] hover:shadow-[0_0_40px_rgba(255,102,51,0.5)] transition-all`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'} animate-spin`} />
                          SENDING...
                        </>
                      ) : (
                        <>
                          {isMobile ? "GET ACCESS CODE" : "GET MY ACCESS CODE"}
                          <ArrowRight className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Features - Compact */}
                  {!isMobile && (
                    <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-primary/20">
                      <div className="flex flex-col items-center text-center p-2 border border-primary/10 bg-primary/5">
                        <div className="w-6 h-6 border border-primary bg-primary/10 flex items-center justify-center mb-1">
                          <Shield className="h-3 w-3 text-primary" />
                        </div>
                        <div className="text-[9px] font-mono font-bold text-white/90 tracking-wider leading-tight">
                          PRODUCTION<br/>READY
                        </div>
                      </div>

                      <div className="flex flex-col items-center text-center p-2 border border-primary/10 bg-primary/5">
                        <div className="w-6 h-6 border border-primary bg-primary/10 flex items-center justify-center mb-1">
                          <Code2 className="h-3 w-3 text-primary" />
                        </div>
                        <div className="text-[9px] font-mono font-bold text-white/90 tracking-wider leading-tight">
                          100% OPEN<br/>SOURCE
                        </div>
                      </div>

                      <div className="flex flex-col items-center text-center p-2 border border-primary/10 bg-primary/5">
                        <div className="w-6 h-6 border border-primary bg-primary/10 flex items-center justify-center mb-1">
                          <Zap className="h-3 w-3 text-primary" />
                        </div>
                        <div className="text-[9px] font-mono font-bold text-white/90 tracking-wider leading-tight">
                          NODE-BASED<br/>POWER
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile compact features */}
                  {isMobile && (
                    <div className="flex items-center justify-center gap-3 pt-3 mt-3 border-t border-primary/20">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-primary" />
                        <span className="text-[9px] font-mono text-white/70">PRODUCTION</span>
                      </div>
                      <div className="w-px h-3 bg-primary/30" />
                      <div className="flex items-center gap-1">
                        <Code2 className="h-3 w-3 text-primary" />
                        <span className="text-[9px] font-mono text-white/70">OPEN SOURCE</span>
                      </div>
                      <div className="w-px h-3 bg-primary/30" />
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-primary" />
                        <span className="text-[9px] font-mono text-white/70">POWERFUL</span>
                      </div>
                    </div>
                  )}

                  {/* Footer Note */}
                  <div className={`${isMobile ? 'pt-2' : 'pt-3'} border-t border-primary/10`}>
                    <p className={`${isMobile ? 'text-[10px]' : 'text-[10px]'} text-center text-muted-foreground font-mono leading-relaxed`}>
                      {isMobile
                        ? <>No spam. No BS. Just your code.</>
                        : <>
                            We respect your inbox. One email with your access code.<br />
                            <span className="text-primary/70">No spam. No tracking. No bullshit.</span>
                          </>
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
                  {/* Success Header */}
                  <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className={`${isMobile ? 'w-10 h-10' : 'w-11 h-11'} border-2 border-green-500 bg-green-500/10 flex items-center justify-center animate-pulse`}>
                        <Check className={`${isMobile ? 'h-5 w-5' : 'h-5 w-5'} text-green-500`} />
                      </div>
                    </div>

                    <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-mono font-bold text-center tracking-tight leading-none`}>
                      {isMobile ? "CODE SENT" : "CODE SENT. CHECK YOUR INBOX."}
                    </h2>

                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-center font-mono leading-relaxed bg-primary/5 border border-primary/20 ${isMobile ? 'p-3' : 'p-3'}`}>
                      <p className="text-white/80">
                        {isMobile ? "Sent to" : "We've sent a 6-digit access code to"}
                      </p>
                      <p className="text-primary font-bold mt-1 break-all">
                        {email}
                      </p>
                    </div>

                    <p className={`${isMobile ? 'text-[10px]' : 'text-[10px]'} text-center text-muted-foreground font-mono`}>
                      {isMobile ? "Check spam if not in inbox" : "Usually arrives within 60 seconds. Check spam if you don't see it."}
                    </p>
                  </div>

                  {/* Code Form */}
                  <form onSubmit={handleCodeSubmit} className={isMobile ? 'space-y-3' : 'space-y-4'}>
                    <div>
                      <label className={`block ${isMobile ? 'text-[10px]' : 'text-[11px]'} font-mono font-bold ${isMobile ? 'mb-2' : 'mb-2'} text-primary tracking-widest text-center flex items-center justify-center gap-1.5`}>
                        <Lock className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
                        {isMobile ? "6-DIGIT CODE" : "ENTER YOUR 6-DIGIT CODE"}
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/20 rounded-none opacity-50 group-focus-within:opacity-100 blur-lg transition-opacity" />
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={accessCode}
                          onChange={(e) => handleCodeInput(e.target.value)}
                          placeholder="• • • • • •"
                          className={`relative ${isMobile ? 'h-16 text-3xl' : 'h-16 text-4xl'} border-2 border-primary/50 bg-black/50 font-mono text-center tracking-[0.5em] rounded-none focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 transition-all placeholder:text-primary/20`}
                          maxLength={6}
                          disabled={isLoading}
                          required
                          autoFocus
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <div className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground">
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full border transition-all ${
                                i < accessCode.length
                                  ? 'bg-primary border-primary shadow-[0_0_10px_rgba(255,102,51,0.5)]'
                                  : 'bg-transparent border-primary/30'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || accessCode.length !== 6}
                      className={`w-full ${isMobile ? 'h-11 text-xs' : 'h-12 text-sm'} rounded-none bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary font-mono font-bold tracking-wider shadow-[0_0_30px_rgba(255,102,51,0.3)] hover:shadow-[0_0_40px_rgba(255,102,51,0.5)] transition-all disabled:opacity-50`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'} animate-spin`} />
                          VERIFYING...
                        </>
                      ) : (
                        <>
                          {isMobile ? "UNLOCK ACCESS" : "UNLOCK THE PLATFORM"}
                          <Zap className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                        </>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep("email")
                        setAccessCode("")
                      }}
                      className={`w-full ${isMobile ? 'text-[10px] pt-2' : 'text-[10px] pt-2'} font-mono text-muted-foreground hover:text-primary transition-colors border-t border-primary/10`}
                    >
                      ← {isMobile ? "Different email" : "Use a different email address"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Stats - Compact single line */}
          {waitlistCount > 0 && (
            <div className={`${isMobile ? 'mt-3' : 'mt-4'} text-center`}>
              <div className={`inline-flex items-center ${isMobile ? 'gap-2' : 'gap-2.5'} border border-primary/30 bg-black/80 backdrop-blur-xl ${isMobile ? 'px-3 py-2' : 'px-5 py-2'}`}>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  {!isMobile && <span className="text-[10px] font-mono text-muted-foreground">LIVE</span>}
                </div>
                <div className="w-px h-3 bg-primary/30" />
                <span className={`${isMobile ? 'text-xs' : 'text-xs'} font-mono`}>
                  <span className="text-primary font-bold tabular-nums">{waitlistCount}</span>
                  <span className="text-muted-foreground"> {isMobile ? 'waiting' : 'builders in line'}</span>
                </span>
                <div className="w-px h-3 bg-primary/30" />
                <span className={`${isMobile ? 'text-xs' : 'text-xs'} font-mono`}>
                  <span className="text-green-500 font-bold tabular-nums">{accessedCount}</span>
                  <span className="text-muted-foreground"> {isMobile ? 'inside' : 'exploring inside'}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  )
}
