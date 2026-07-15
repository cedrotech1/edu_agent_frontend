import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Logo } from "../../components/Logo";
import { ArrowLeft, Sparkles, Copy } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";

export function StyleGuide() {
  const navigate = useNavigate();

  const colors = [
    { name: "Purple", hex: "#6C63FF", var: "--quiz-purple" },
    { name: "Sky Blue", hex: "#4FC3F7", var: "--quiz-sky-blue" },
    { name: "Mint Green", hex: "#43E6B5", var: "--quiz-mint" },
    { name: "Warm White", hex: "#F9F9FF", var: "--quiz-warm-white" },
    { name: "Yellow Accent", hex: "#FFD166", var: "--quiz-yellow" },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              className="rounded-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-[#6C63FF]" />
              <h1 className="text-2xl font-bold text-gray-800">Style Guide</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Logo Variations */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Logo Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white rounded-2xl p-8 shadow-md">
              <div className="flex items-center justify-center mb-4 h-24">
                <Logo variant="horizontal" size="md" />
              </div>
              <p className="text-center text-sm text-gray-600 font-semibold">
                Horizontal Lockup
              </p>
              <p className="text-center text-xs text-gray-500 mt-1">
                Primary logo for headers and navigation
              </p>
            </Card>

            <Card className="bg-white rounded-2xl p-8 shadow-md">
              <div className="flex items-center justify-center mb-4 h-24">
                <Logo variant="icon-only" size="lg" />
              </div>
              <p className="text-center text-sm text-gray-600 font-semibold">
                Icon Only
              </p>
              <p className="text-center text-xs text-gray-500 mt-1">
                For favicons and app icons
              </p>
            </Card>

            <Card className="bg-white rounded-2xl p-8 shadow-md">
              <div className="flex items-center justify-center mb-4 h-24">
                <Logo variant="stacked" size="sm" />
              </div>
              <p className="text-center text-sm text-gray-600 font-semibold">
                Stacked
              </p>
              <p className="text-center text-xs text-gray-500 mt-1">
                For square spaces and landing pages
              </p>
            </Card>
          </div>

          <Card className="bg-white rounded-2xl p-8 shadow-md mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Logo in Different Sizes</h3>
            <div className="flex items-center gap-8 flex-wrap">
              <div className="text-center">
                <Logo variant="horizontal" size="sm" />
                <p className="text-xs text-gray-500 mt-2">Small</p>
              </div>
              <div className="text-center">
                <Logo variant="horizontal" size="md" />
                <p className="text-xs text-gray-500 mt-2">Medium</p>
              </div>
              <div className="text-center">
                <Logo variant="horizontal" size="lg" />
                <p className="text-xs text-gray-500 mt-2">Large</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Color Palette */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Color Palette</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {colors.map((color) => (
              <Card key={color.hex} className="bg-white rounded-2xl p-6 shadow-md">
                <div
                  className="w-full h-24 rounded-xl mb-4 shadow-inner"
                  style={{ backgroundColor: color.hex }}
                ></div>
                <h3 className="font-semibold text-gray-800 mb-2">{color.name}</h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">HEX</span>
                    <code className="text-sm font-mono text-gray-800">{color.hex}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">CSS</span>
                    <code className="text-xs font-mono text-gray-800">{color.var}</code>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Typography</h2>
          <Card className="bg-white rounded-2xl p-8 shadow-md">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Font Family: Poppins</p>
                <h1 className="text-5xl font-bold text-gray-800">Heading 1 - Bold</h1>
              </div>
              <div>
                <h2 className="text-4xl font-semibold text-gray-800">Heading 2 - Semibold</h2>
              </div>
              <div>
                <h3 className="text-3xl font-semibold text-gray-800">Heading 3 - Semibold</h3>
              </div>
              <div>
                <h4 className="text-2xl font-medium text-gray-800">Heading 4 - Medium</h4>
              </div>
              <div>
                <p className="text-lg text-gray-700">
                  Body Text - Regular (18px): Lorem ipsum dolor sit amet, consectetur
                  adipiscing elit.
                </p>
              </div>
              <div>
                <p className="text-base text-gray-600">
                  Body Text - Regular (16px): Lorem ipsum dolor sit amet, consectetur
                  adipiscing elit.
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Caption - Regular (14px): Lorem ipsum dolor sit amet
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Buttons */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Buttons</h2>
          <Card className="bg-white rounded-2xl p-8 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-3">Primary</p>
                <Button className="w-full bg-[#6C63FF] hover:bg-[#5851E6] text-white rounded-2xl">
                  Click Me
                </Button>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-3">Secondary</p>
                <Button
                  variant="outline"
                  className="w-full border-2 border-[#4FC3F7] text-[#4FC3F7] hover:bg-[#4FC3F7]/10 rounded-2xl"
                >
                  Click Me
                </Button>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-3">Success</p>
                <Button className="w-full bg-[#43E6B5] hover:bg-[#2DD49E] text-white rounded-2xl">
                  Click Me
                </Button>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-3">Danger</p>
                <Button className="w-full bg-red-500 hover:bg-red-600 text-white rounded-2xl">
                  Click Me
                </Button>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-3">Disabled</p>
                <Button disabled className="w-full rounded-2xl">
                  Disabled
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Input Fields */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Input Fields</h2>
          <Card className="bg-white rounded-2xl p-8 shadow-md">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-3">Default</p>
                <Input
                  placeholder="Enter text..."
                  className="rounded-xl border-2 border-gray-200 px-4 py-3"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-3">Focused</p>
                <Input
                  placeholder="Enter text..."
                  className="rounded-xl border-2 border-[#6C63FF] px-4 py-3"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-3">Error</p>
                <Input
                  placeholder="Enter text..."
                  className="rounded-xl border-2 border-red-500 px-4 py-3"
                />
                <p className="text-sm text-red-500 mt-2">This field is required</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Badges */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Badges</h2>
          <Card className="bg-white rounded-2xl p-8 shadow-md">
            <div className="flex flex-wrap gap-4">
              <Badge className="bg-[#6C63FF]/10 text-[#6C63FF] rounded-full px-4 py-1">
                Teacher
              </Badge>
              <Badge className="bg-[#4FC3F7]/10 text-[#4FC3F7] rounded-full px-4 py-1">
                Student
              </Badge>
              <Badge className="bg-[#43E6B5]/10 text-[#43E6B5] rounded-full px-4 py-1">
                Active
              </Badge>
              <Badge className="bg-[#FFD166]/10 text-[#FFD166] rounded-full px-4 py-1">
                Pending
              </Badge>
              <Badge className="bg-red-100 text-red-600 rounded-full px-4 py-1">
                Error
              </Badge>
            </div>
          </Card>
        </section>

        {/* Cards */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Default Card
              </h3>
              <p className="text-gray-600">
                This is a default card with shadow and rounded corners
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-[#6C63FF] to-[#5851E6] text-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Gradient Card</h3>
              <p className="text-white/90">
                This is a gradient card with bold colors
              </p>
            </Card>
          </div>
        </section>

        {/* Progress Bars */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Progress Bars</h2>
          <Card className="bg-white rounded-2xl p-8 shadow-md">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">75% Complete</span>
                </div>
                <Progress value={75} className="h-3 bg-gray-200" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">50% Complete</span>
                </div>
                <Progress value={50} className="h-3 bg-gray-200" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">25% Complete</span>
                </div>
                <Progress value={25} className="h-3 bg-gray-200" />
              </div>
            </div>
          </Card>
        </section>

        {/* Avatars */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Avatars</h2>
          <Card className="bg-white rounded-2xl p-8 shadow-md">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <Avatar className="w-16 h-16 bg-[#6C63FF] mx-auto mb-2">
                  <AvatarFallback className="text-white font-semibold text-xl">
                    MJ
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-gray-600">Large</p>
              </div>
              <div className="text-center">
                <Avatar className="w-12 h-12 bg-[#4FC3F7] mx-auto mb-2">
                  <AvatarFallback className="text-white font-semibold">
                    AM
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-gray-600">Medium</p>
              </div>
              <div className="text-center">
                <Avatar className="w-8 h-8 bg-[#43E6B5] mx-auto mb-2">
                  <AvatarFallback className="text-white font-semibold text-xs">
                    AD
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-gray-600">Small</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Design Principles */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Design Principles</h2>
          <Card className="bg-white rounded-2xl p-8 shadow-md">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  🎨 Friendly & Playful
                </h3>
                <p className="text-gray-600">
                  Use rounded corners everywhere (16px-24px radius), soft shadows, and bouncy
                  layouts to create a warm, approachable feel
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  📏 8px Spacing Grid
                </h3>
                <p className="text-gray-600">
                  Maintain consistent spacing using multiples of 8px (8, 16, 24, 32, etc.)
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  🌈 Bold, Vibrant Colors
                </h3>
                <p className="text-gray-600">
                  Use the QuizMind AI color palette to create visual hierarchy and role
                  differentiation
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  ✨ Emoji & Icons
                </h3>
                <p className="text-gray-600">
                  Add personality with carefully chosen emojis and friendly Lucide icons
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}