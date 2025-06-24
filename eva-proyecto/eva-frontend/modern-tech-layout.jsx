import { useState } from "react"
import {
  Zap,
  Database,
  Server,
  Code,
  Terminal,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Shield,
  Layers,
  GitBranch,
  Upload,
  Download,
  FileText,
  BarChart3,
  Settings,
  Bell,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function ModernTechLayout() {
  const [activeSection, setActiveSection] = useState("dashboard")

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Futuristic Header */}
      <header
        className="bg-black/50 backdrop-blur-xl border-b border-cyan-500/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center relative">
                <Zap className="w-6 h-6 text-white" />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur-lg opacity-30 animate-pulse"></div>
              </div>
              <div>
                <h1
                  className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  NEXUS CORE
                </h1>
                <p className="text-xs text-gray-400">Advanced File Management System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div
              className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">System Online</span>
            </div>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-gray-800">
              <Bell className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-gray-800">
              <Settings className="w-4 h-4" />
            </Button>
            <div
              className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div
                      className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center relative">
                      <Database className="w-8 h-8 text-white" />
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    </div>
                    <h3 className="font-semibold text-white">Data Core</h3>
                    <p className="text-sm text-gray-400">Neural Network Active</p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700/50"
                      onClick={() => setActiveSection("dashboard")}>
                      <Activity className="w-4 h-4 mr-3" />
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700/50"
                      onClick={() => setActiveSection("files")}>
                      <HardDrive className="w-4 h-4 mr-3" />
                      File System
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700/50"
                      onClick={() => setActiveSection("network")}>
                      <Network className="w-4 h-4 mr-3" />
                      Network
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700/50"
                      onClick={() => setActiveSection("security")}>
                      <Shield className="w-4 h-4 mr-3" />
                      Security
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm mt-4">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4 flex items-center">
                  <Cpu className="w-4 h-4 mr-2 text-cyan-400" />
                  System Status
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">CPU Usage</span>
                      <span className="text-cyan-400">23%</span>
                    </div>
                    <Progress value={23} className="h-2 bg-gray-700" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Memory</span>
                      <span className="text-green-400">67%</span>
                    </div>
                    <Progress value={67} className="h-2 bg-gray-700" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Storage</span>
                      <span className="text-yellow-400">45%</span>
                    </div>
                    <Progress value={45} className="h-2 bg-gray-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            {activeSection === "dashboard" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card
                    className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-cyan-400">Active Files</p>
                          <p className="text-2xl font-bold text-white">1,247</p>
                        </div>
                        <FileText className="w-8 h-8 text-cyan-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-400">Data Processed</p>
                          <p className="text-2xl font-bold text-white">2.4 TB</p>
                        </div>
                        <Database className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-400">Repositories</p>
                          <p className="text-2xl font-bold text-white">24</p>
                        </div>
                        <GitBranch className="w-8 h-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-400">Uptime</p>
                          <p className="text-2xl font-bold text-white">99.9%</p>
                        </div>
                        <Server className="w-8 h-8 text-orange-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Terminal className="w-5 h-5 mr-2 text-cyan-400" />
                      System Terminal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                      <div className="text-green-400">$ nexus-core --status</div>
                      <div className="text-gray-300 mt-2">
                        [INFO] System initialization complete
                        <br />
                        [INFO] Neural network online
                        <br />
                        [INFO] File system mounted successfully
                        <br />
                        [INFO] Security protocols active
                        <br />
                        <span className="text-cyan-400">[READY]</span> Awaiting commands...
                      </div>
                      <div className="flex items-center mt-4">
                        <span className="text-cyan-400">$</span>
                        <Input
                          className="ml-2 bg-transparent border-none text-white focus:ring-0 p-0"
                          placeholder="Enter command..." />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" />
                      Real-time Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">Network Traffic</h4>
                        <div className="space-y-2">
                          {[
                            { label: "Incoming", value: 85, color: "bg-cyan-500" },
                            { label: "Outgoing", value: 62, color: "bg-blue-500" },
                            { label: "Internal", value: 34, color: "bg-purple-500" },
                          ].map((item, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <span className="text-sm text-gray-300 w-16">{item.label}</span>
                              <div className="flex-1 bg-gray-700 rounded-full h-2">
                                <div
                                  className={`${item.color} h-2 rounded-full`}
                                  style={{ width: `${item.value}%` }}></div>
                              </div>
                              <span className="text-sm text-gray-400 w-8">{item.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">File Operations</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-300">Uploads Today</span>
                            <Badge variant="outline" className="text-green-400 border-green-400">
                              +127
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-300">Downloads</span>
                            <Badge variant="outline" className="text-blue-400 border-blue-400">
                              +89
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-300">Sync Operations</span>
                            <Badge variant="outline" className="text-purple-400 border-purple-400">
                              +45
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "files" && (
              <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center text-white">
                      <Layers className="w-5 h-5 mr-2 text-cyan-400" />
                      File System Interface
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                      <Button
                        variant="outline"
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                        <Download className="w-4 h-4 mr-2" />
                        Sync
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "neural-networks/", type: "folder", size: "2.4 GB", status: "synced" },
                      { name: "data-models.json", type: "file", size: "156 MB", status: "processing" },
                      { name: "quantum-algorithms.py", type: "file", size: "89 KB", status: "synced" },
                      { name: "blockchain-ledger.db", type: "file", size: "1.2 GB", status: "uploading" },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
                        <div className="flex items-center space-x-4">
                          <div
                            className="w-10 h-10 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                            {item.type === "folder" ? (
                              <Layers className="w-5 h-5 text-cyan-400" />
                            ) : (
                              <Code className="w-5 h-5 text-blue-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{item.name}</h3>
                            <p className="text-sm text-gray-400">{item.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant="outline"
                            className={
                              item.status === "synced"
                                ? "text-green-400 border-green-400"
                                : item.status === "processing"
                                  ? "text-yellow-400 border-yellow-400"
                                  : "text-blue-400 border-blue-400"
                            }>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
