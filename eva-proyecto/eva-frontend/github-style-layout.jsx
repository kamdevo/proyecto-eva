import { useState } from "react"
import {
  GitBranch,
  Upload,
  FileText,
  BarChart3,
  User,
  Bell,
  Plus,
  Folder,
  Star,
  Eye,
  Download,
  Calendar,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function GitHubStyleLayout() {
  const [activeTab, setActiveTab] = useState("repositories")

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* GitHub-style Header */}
      <header
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-8 h-8 text-gray-900 dark:text-white" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Reportes Inovación</span>
            </div>
            <div className="hidden md:flex items-center space-x-4 ml-8">
              <Input
                placeholder="Search repositories..."
                className="w-80 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">John Doe</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">@johndoe</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Repositories</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Files uploaded</span>
                    <span className="font-semibold">248</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Storage used</span>
                    <span className="font-semibold">2.4 GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">
                        Uploaded <span className="font-semibold">report.pdf</span>
                      </p>
                      <p className="text-gray-500 text-xs">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">
                        Created branch <span className="font-semibold">feature/analytics</span>
                      </p>
                      <p className="text-gray-500 text-xs">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="repositories">Repositories</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="repositories" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Repositories</h2>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Repository
                  </Button>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((repo) => (
                    <Card key={repo} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Folder className="w-4 h-4 text-blue-600" />
                              <h3 className="font-semibold text-blue-600 hover:underline cursor-pointer">
                                project-{repo}
                              </h3>
                              <Badge variant="secondary">Public</Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              Advanced file management system with version control and reporting capabilities.
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span>TypeScript</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4" />
                                <span>24</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>8</span>
                              </div>
                              <span>Updated 2 days ago</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="files" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Files</CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download All
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {["document.pdf", "presentation.pptx", "data.xlsx", "video.mp4"].map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{file}</p>
                              <p className="text-sm text-gray-500">Modified 2 hours ago</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">2.4 MB</Badge>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upload" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Drag and drop files here
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">or click to browse files</p>
                      <Button>Choose Files</Button>
                    </div>
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Upload Settings</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Repository</label>
                          <Input placeholder="Select repository" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Branch</label>
                          <Input placeholder="main" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Commit message</label>
                          <Input placeholder="Add new files" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Analytics & Reports</CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          Last 30 days
                        </Button>
                        <Button variant="outline" size="sm">
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400">Total Files</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">248</p>
                          </div>
                          <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-600 dark:text-green-400">Storage Used</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">2.4 GB</p>
                          </div>
                          <BarChart3 className="w-8 h-8 text-green-600" />
                        </div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-purple-600 dark:text-purple-400">Active Users</p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">12</p>
                          </div>
                          <User className="w-8 h-8 text-purple-600" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Recent Activity</h4>
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="font-medium">File uploaded: report-{item}.pdf</p>
                              <p className="text-sm text-gray-500">by John Doe • 2 hours ago</p>
                            </div>
                          </div>
                          <Badge variant="outline">PDF</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
