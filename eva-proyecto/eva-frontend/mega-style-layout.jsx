"use client"

import { useState } from "react"
import {
  Cloud,
  Upload,
  Folder,
  File,
  Search,
  Grid3X3,
  List,
  Star,
  Share,
  Trash2,
  MoreVertical,
  Play,
  ImageIcon,
  FileText,
  Archive,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function MegaStyleLayout() {
  const [viewMode, setViewMode] = useState("grid")
  const [selectedFiles, setSelectedFiles] = useState([])

  const files = [
    {
      id: 1,
      name: "Project Presentation.pptx",
      type: "presentation",
      size: "15.2 MB",
      modified: "2 hours ago",
      thumbnail: "/placeholder.svg",
    },
    {
      id: 2,
      name: "Financial Report Q4.pdf",
      type: "pdf",
      size: "8.7 MB",
      modified: "5 hours ago",
      thumbnail: "/placeholder.svg",
    },
    {
      id: 3,
      name: "Demo Video.mp4",
      type: "video",
      size: "124.5 MB",
      modified: "1 day ago",
      thumbnail: "/placeholder.svg",
    },
    {
      id: 4,
      name: "Database Backup.zip",
      type: "archive",
      size: "45.8 MB",
      modified: "2 days ago",
      thumbnail: "/placeholder.svg",
    },
    {
      id: 5,
      name: "Marketing Assets",
      type: "folder",
      size: "12 items",
      modified: "3 days ago",
      thumbnail: "/placeholder.svg",
    },
    {
      id: 6,
      name: "User Manual.docx",
      type: "document",
      size: "2.1 MB",
      modified: "1 week ago",
      thumbnail: "/placeholder.svg",
    },
  ]

  const getFileIcon = (type) => {
    switch (type) {
      case "video":
        return <Play className="w-6 h-6 text-red-500" />;
      case "pdf":
        return <FileText className="w-6 h-6 text-red-600" />;
      case "folder":
        return <Folder className="w-6 h-6 text-blue-500" />;
      case "archive":
        return <Archive className="w-6 h-6 text-yellow-600" />;
      case "image":
        return <ImageIcon className="w-6 h-6 text-green-500" />;
      default:
        return <File className="w-6 h-6 text-gray-500" />;
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      {/* Mega-style Header */}
      <header
        className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">MEGA Drive</h1>
                <p className="text-xs text-white/70">Reportes Inovación</p>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <Input
                placeholder="Search files and folders..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:bg-white/20" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Avatar className="w-8 h-8 border-2 border-white/30">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-white/20 text-white">U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div
                      className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Cloud className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-white">Cloud Storage</h3>
                    <p className="text-sm text-white/70">2.4 GB of 15 GB used</p>
                  </div>

                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: "16%" }}></div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10">
                      <Folder className="w-4 h-4 mr-3" />
                      All Files
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10">
                      <Star className="w-4 h-4 mr-3" />
                      Starred
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10">
                      <Share className="w-4 h-4 mr-3" />
                      Shared
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10">
                      <Trash2 className="w-4 h-4 mr-3" />
                      Trash
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 mt-4">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Storage Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-white/80">Documents</span>
                    </div>
                    <span className="text-sm text-white">1.2 GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-white/80">Videos</span>
                    </div>
                    <span className="text-sm text-white">800 MB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-white/80">Images</span>
                    </div>
                    <span className="text-sm text-white">400 MB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">My Files</h2>
                    <p className="text-sm text-white/70">{files.length} items</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={viewMode === "grid" ? "bg-white/20" : "text-white hover:bg-white/10"}>
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={viewMode === "list" ? "bg-white/20" : "text-white hover:bg-white/10"}>
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="group relative bg-white/5 hover:bg-white/10 rounded-lg p-4 cursor-pointer transition-all duration-200 border border-white/10 hover:border-white/30">
                        <div
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>Download</DropdownMenuItem>
                              <DropdownMenuItem>Share</DropdownMenuItem>
                              <DropdownMenuItem>Rename</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="text-center">
                          <div
                            className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-white/10 rounded-lg">
                            {getFileIcon(file.type)}
                          </div>
                          <h3 className="font-medium text-white text-sm mb-1 truncate">{file.name}</h3>
                          <p className="text-xs text-white/60">{file.size}</p>
                          <p className="text-xs text-white/50">{file.modified}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-200 border border-white/10 hover:border-white/30">
                        <div className="flex items-center space-x-4">
                          <div
                            className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg">
                            {getFileIcon(file.type)}
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{file.name}</h3>
                            <p className="text-sm text-white/60">{file.modified}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="text-white/80 border-white/30">
                            {file.size}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>Download</DropdownMenuItem>
                              <DropdownMenuItem>Share</DropdownMenuItem>
                              <DropdownMenuItem>Rename</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
