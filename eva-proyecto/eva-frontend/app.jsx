import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MegaStyleLayout from "./mega-style-layout"
import ModernTechLayout from "./modern-tech-layout"
import EnhancedGitHubLayout from "./enhanced-github-layout"

export default function App() {
  return (
    <div className="min-h-screen">
      <Tabs defaultValue="github" className="w-full">
        <div
          className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="github">GitHub Style</TabsTrigger>
            <TabsTrigger value="mega">Mega Style</TabsTrigger>
            <TabsTrigger value="tech">Tech Style</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="github" className="mt-0">
          <EnhancedGitHubLayout />
        </TabsContent>

        <TabsContent value="mega" className="mt-0">
          <MegaStyleLayout />
        </TabsContent>

        <TabsContent value="tech" className="mt-0">
          <ModernTechLayout />
        </TabsContent>
      </Tabs>
    </div>
  );
}
