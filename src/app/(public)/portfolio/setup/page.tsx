/**
 * Portfolio Setup Wizard
 * Route: /portfolio/setup
 * 
 * First-time portfolio creation flow:
 * 1. Choose username (with real-time availability check)
 * 2. Add bio and social links (optional)
 * 3. Select theme
 * 4. Complete → Redirect to portfolio
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Check,
  X,
  Loader2,
  User,
  MapPin,
  Link as LinkIcon,
  Linkedin,
  Twitter,
  Github,
} from 'lucide-react';

export default function PortfolioSetupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/portfolio/setup');
    }
  }, [status, router]);

  // Fetch username suggestions on mount
  useEffect(() => {
    if (session?.user) {
      fetchUsernameSuggestions();
    }
  }, [session]);

  // Check username availability with debounce
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(() => {
      checkUsernameAvailability();
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const fetchUsernameSuggestions = async () => {
    try {
      const res = await fetch('/api/portfolio/username/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const checkUsernameAvailability = async () => {
    setCheckingUsername(true);
    try {
      const res = await fetch(`/api/portfolio/username/check?username=${username}`);
      const data = await res.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSubmit = async () => {
    if (!usernameAvailable || !username) {
      alert('Please choose an available username');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/portfolio/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          bio,
          location,
          websiteUrl,
          linkedinUrl,
          twitterHandle,
          githubUrl,
          portfolioTheme: 'default',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Success! Redirect to portfolio
        router.push(`/u/${username}`);
      } else {
        alert(data.message || 'Failed to create portfolio');
      }
    } catch (error) {
      console.error('Error creating portfolio:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'url(/grid.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '112px 112px',
          opacity: 0.3,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 border-2 border-primary flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold font-mono mb-2">CREATE YOUR PORTFOLIO</h1>
          <p className="text-muted-foreground font-mono">
            Showcase your n8n workflows to potential clients
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 border-2 flex items-center justify-center font-mono text-sm ${step >= 1 ? 'border-primary bg-primary/10' : 'border-muted'}`}>
              1
            </div>
            <span className="text-sm font-mono">USERNAME</span>
          </div>
          <div className="w-12 h-0.5 bg-muted" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 border-2 flex items-center justify-center font-mono text-sm ${step >= 2 ? 'border-primary bg-primary/10' : 'border-muted'}`}>
              2
            </div>
            <span className="text-sm font-mono">DETAILS</span>
          </div>
        </div>

        {/* Step 1: Username */}
        {step === 1 && (
          <Card className="border-2 bg-background/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold font-mono mb-6">Choose Your Username</h2>
              
              {/* Username Input */}
              <div className="mb-6">
                <label className="text-sm font-mono font-bold mb-2 block">
                  USERNAME *
                </label>
                <div className="relative">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="your_username"
                    className="font-mono pr-10"
                    maxLength={30}
                  />
                  {checkingUsername && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                  {!checkingUsername && usernameAvailable === true && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  )}
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-2">
                  3-30 characters, lowercase letters, numbers, and underscores only
                </p>
                {usernameAvailable === false && (
                  <p className="text-xs font-mono text-red-500 mt-1">
                    Username is already taken
                  </p>
                )}
                {usernameAvailable === true && (
                  <p className="text-xs font-mono text-green-500 mt-1">
                    Username is available!
                  </p>
                )}
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && !username && (
                <div className="mb-6">
                  <label className="text-sm font-mono font-bold mb-2 block">
                    SUGGESTIONS
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors"
                        onClick={() => setUsername(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* URL Preview */}
              {username && usernameAvailable && (
                <div className="mb-6 p-4 border-2 bg-primary/5">
                  <p className="text-xs font-mono text-muted-foreground mb-1">YOUR PORTFOLIO URL</p>
                  <p className="font-mono text-primary">
                    flowkit.in/u/{username}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!usernameAvailable}
                  className="font-mono"
                >
                  NEXT: ADD DETAILS
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <Card className="border-2 bg-background/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold font-mono mb-2">Tell Us About Yourself</h2>
              <p className="text-sm font-mono text-muted-foreground mb-6">
                Optional: Add details to make your portfolio stand out
              </p>

              <div className="space-y-6">
                {/* Bio */}
                <div>
                  <label className="text-sm font-mono font-bold mb-2 block flex items-center gap-2">
                    <User className="w-4 h-4" />
                    BIO
                  </label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Automation expert specializing in workflow optimization..."
                    className="font-mono"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    {bio.length}/500 characters
                  </p>
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-mono font-bold mb-2 block flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    LOCATION
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="New York, USA"
                    className="font-mono"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="text-sm font-mono font-bold mb-2 block flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    WEBSITE
                  </label>
                  <Input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    type="url"
                    className="font-mono"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="text-sm font-mono font-bold mb-2 block flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LINKEDIN
                  </label>
                  <Input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    type="url"
                    className="font-mono"
                  />
                </div>

                {/* Twitter */}
                <div>
                  <label className="text-sm font-mono font-bold mb-2 block flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    TWITTER
                  </label>
                  <Input
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value.replace('@', ''))}
                    placeholder="yourusername"
                    className="font-mono"
                  />
                </div>

                {/* GitHub */}
                <div>
                  <label className="text-sm font-mono font-bold mb-2 block flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    GITHUB
                  </label>
                  <Input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/yourusername"
                    type="url"
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="font-mono border-2"
                >
                  BACK
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="font-mono"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      CREATING...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      CREATE PORTFOLIO
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
