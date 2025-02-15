'use client'

import React, { useState, useEffect } from "react"
import {
  AlertCircle,
  Bell,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Filter,
  Home,
  LogOut,
  Menu as MenuIcon,
  MessageSquare,
  Plus,
  Search,
  Send,
  Settings,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Header } from "@/components/layout/Header"

const Dashboard = () => {
  const [tasks, setTasks] = useState([])
  const [friends, setFriends] = useState([])
  const [notifications, setNotifications] = useState([])
  const [chats, setChats] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [newFriendEmail, setNewFriendEmail] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showChats, setShowChats] = useState(false)
  const [activeChat, setActiveChat] = useState(null)
  const [activeSection, setActiveSection] = useState("dashboard")

  // Datos de ejemplo
  const mockTasks = [
    {
      id: 1,
      title: "Presentación del proyecto Q4",
      description: "Preparar slides y demo para la presentación trimestral",
      priority: "high",
      dueDate: "2024-11-10",
      status: "in-progress",
      sharedWith: [
        { id: 1, name: "Ana García", avatar: "/api/placeholder/32/32", role: "Editor" },
        { id: 2, name: "Carlos López", avatar: "/api/placeholder/32/32", role: "Viewer" },
        { id: 3, name: "María Rodríguez", avatar: "/api/placeholder/32/32", role: "Editor" },
      ],
    },
    {
      id: 2,
      title: "Revisión de métricas mensuales",
      description: "Analizar KPIs y preparar reporte de rendimiento",
      priority: "medium",
      dueDate: "2024-11-15",
      status: "pending",
      sharedWith: [
        { id: 4, name: "Juan Pérez", avatar: "/api/placeholder/32/32", role: "Editor" },
        { id: 5, name: "Laura Sánchez", avatar: "/api/placeholder/32/32", role: "Viewer" },
      ],
    },
  ]

  const mockFriends = [
    {
      id: 1,
      name: "Ana García",
      email: "ana@example.com",
      avatar: "/api/placeholder/32/32",
      status: "online",
      role: "Product Designer",
      recentCollabs: 3,
    },
    {
      id: 2,
      name: "Carlos López",
      email: "carlos@example.com",
      avatar: "/api/placeholder/32/32",
      status: "offline",
      role: "Developer",
      recentCollabs: 5,
    },
    {
      id: 3,
      name: "María Rodríguez",
      email: "maria@example.com",
      avatar: "/api/placeholder/32/32",
      status: "online",
      role: "Project Manager",
      recentCollabs: 8,
    },
  ]

  const mockNotifications = [
    {
      id: 1,
      type: "friend_request",
      from: "Alice Johnson",
      timestamp: "2024-11-06T10:30:00",
      status: "pending",
    },
    {
      id: 2,
      type: "task_shared",
      from: "Bob Wilson",
      taskId: 1,
      taskTitle: "Presentación del proyecto Q4",
      timestamp: "2024-11-06T09:15:00",
      status: "unread",
    },
  ]

  const mockChats = [
    {
      id: 1,
      name: "Ana García",
      avatar: "/api/placeholder/32/32",
      lastMessage: "¿Cómo va el proyecto?",
      timestamp: "2024-11-06T11:30:00",
      unread: 2,
    },
    {
      id: 2,
      name: "Carlos López",
      avatar: "/api/placeholder/32/32",
      lastMessage: "Revisé los cambios, todo se ve bien",
      timestamp: "2024-11-06T10:45:00",
      unread: 0,
    },
  ]

  useEffect(() => {
    // Simular carga de datos
    const fetchData = async () => {
      try {
        setTasks(mockTasks)
        setFriends(mockFriends)
        setNotifications(mockNotifications)
        setChats(mockChats)
      } catch (err) {
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleTaskClick = (taskId) => {
    console.log(`Navigating to task ${taskId}`)
  }

  const handleAddFriend = async () => {
    try {
      console.log("Sending friend request to:", newFriendEmail)
      setNewFriendEmail("")
    } catch (err) {
      setError("Failed to send friend request")
    }
  }

  const handleNotificationAction = async (notificationId, action) => {
    try {
      console.log(`Notification ${notificationId} ${action}`)
      setNotifications(notifications.filter((n) => n.id !== notificationId))
    } catch (err) {
      setError("Failed to process notification")
    }
  }

  const handleChatClick = (chatId) => {
    const chat = chats.find((c) => c.id === chatId)
    setActiveChat(chat)
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === "all" || task.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl font-semibold">Mis Tareas</h2>
                <p className="text-gray-500">Tienes {tasks.length} tareas pendientes</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Tarea
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Tarea</DialogTitle>
                    <DialogDescription>Añade los detalles de tu nueva tarea</DialogDescription>
                  </DialogHeader>
                  {/* Aquí iría el formulario de nueva tarea */}
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedFilter === "all" ? "default" : "outline"}
                onClick={() => setSelectedFilter("all")}
              >
                <Filter className="h-4 w-4 mr-2" />
                Todas
              </Button>
              <Button
                variant={selectedFilter === "pending" ? "default" : "outline"}
                onClick={() => setSelectedFilter("pending")}
              >
                Pendientes
              </Button>
              <Button
                variant={selectedFilter === "in-progress" ? "default" : "outline"}
                onClick={() => setSelectedFilter("in-progress")}
              >
                En Progreso
              </Button>
              <Button
                variant={selectedFilter === "completed" ? "default" : "outline"}
                onClick={() => setSelectedFilter("completed")}
              >
                Completadas
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleTaskClick(task.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(task.status)}
                            <h3 className="font-semibold text-lg">{task.title}</h3>
                          </div>
                          <p className="text-sm text-gray-500">{task.description}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Compartir</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(task.dueDate)}
                        </Badge>
                        <Badge
                          className={
                            task.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {task.sharedWith.map((user) => (
                            <Avatar key={user.id} className="border-2 border-white h-8 w-8">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                          ))}
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full ml-2"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      case "friends":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">Colaboradores</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Añadir
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Añadir Colaborador</DialogTitle>
                    <DialogDescription>Invita a nuevos colaboradores a tus proyectos</DialogDescription>
                  </DialogHeader>
                  <Input
                    placeholder="Correo electrónico"
                    value={newFriendEmail}
                    onChange={(e) => setNewFriendEmail(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleAddFriend}>
                    Enviar Invitación
                  </Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback>{friend.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{friend.name}</p>
                          <Badge
                            variant="outline"
                            className={
                              friend.status === "online" ? "text-green-600" : "text-gray-500"
                            }
                          >
                            {friend.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{friend.role}</p>
                        <p className="text-xs text-gray-400">
                          {friend.recentCollabs} colaboraciones recientes
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      case "statistics":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Tareas completadas</span>
                  <Badge variant="outline">12 esta semana</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Colaboraciones activas</span>
                  <Badge variant="outline">8 proyectos</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      case "messages":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Mensajes</h2>
            <p>Aquí se mostrarían los mensajes y chats con colaboradores.</p>
          </div>
        )
      case "calendar":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Calendario</h2>
            <p>Aquí se mostraría un calendario con las fechas de vencimiento de las tareas.</p>
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r">
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold">TaskMaster</h1>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Button
                variant={activeSection === "dashboard" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("dashboard")}
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </li>
            <li>
              <Button
                variant={activeSection === "friends" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("friends")}
              >
                <Users className="mr-2 h-4 w-4" />
                Amigos
              </Button>
            </li>
            <li>
              <Button
                variant={activeSection === "statistics" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("statistics")}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Estadísticas
              </Button>
            </li>
            <li>
              <Button
                variant={activeSection === "messages" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("messages")}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Mensajes
              </Button>
            </li>
            <li>
              <Button
                variant={activeSection === "calendar" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection("calendar")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Calendario
              </Button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <MenuIcon className="h-6 w-6 text-gray-500" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                      <SheetDescription>
                        Navegue por las diferentes secciones de la aplicación.
                      </SheetDescription>
                    </SheetHeader>
                    <nav className="mt-4">
                      <ul className="space-y-2">
                        <li>
                          <Button
                            variant={activeSection === "dashboard" ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => {
                              setActiveSection("dashboard")
                              document.querySelector('[data-radix-collection-item]')?.click()
                            }}
                          >
                            <Home className="mr-2 h-4 w-4" />
                            Dashboard
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant={activeSection === "friends" ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => {
                              setActiveSection("friends")
                              document.querySelector('[data-radix-collection-item]')?.click()
                            }}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Amigos
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant={activeSection === "statistics" ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => {
                              setActiveSection("statistics")
                              document.querySelector('[data-radix-collection-item]')?.click()
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Estadísticas
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant={activeSection === "messages" ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => {
                              setActiveSection("messages")
                              document.querySelector('[data-radix-collection-item]')?.click()
                            }}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Mensajes
                          </Button>
                        </li>
                        <li>
                          <Button
                            variant={activeSection === "calendar" ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => {
                              setActiveSection("calendar")
                              document.querySelector('[data-radix-collection-item]')?.click()
                            }}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Calendario
                          </Button>
                        </li>
                      </ul>
                    </nav>
                  </SheetContent>
                </Sheet>
                <div className="flex items-center space-x-2 lg:hidden">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                  <h1 className="text-xl font-semibold">TaskMaster</h1>
                </div>
              </div>

              <div className="hidden md:block flex-1 max-w-xl mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10 bg-gray-50 border-0 w-full"
                    placeholder="Buscar tareas, colaboradores o etiquetas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Popover open={showChats} onOpenChange={setShowChats}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <MessageSquare className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                        {chats.reduce((acc, chat) => acc + chat.unread, 0)}
                      </Badge>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Chats</h3>
                      {chats.map((chat) => (
                        <div
                          key={chat.id}
                          className="flex items-start gap-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleChatClick(chat.id)}
                        >
                          <Avatar>
                            <AvatarImage src={chat.avatar} alt={chat.name} />
                            <AvatarFallback>{chat.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{chat.name}</p>
                            <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                          </div>
                          {chat.unread > 0 && (
                            <Badge>{chat.unread}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                        {notifications.filter((n) => n.status === "unread").length}
                      </Badge>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Notificaciones</h3>
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-start gap-4 p-2 rounded-lg hover:bg-gray-50"
                        >
                          <Avatar>
                            <AvatarFallback>{notification.from[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{notification.from}</span>{" "}
                              {notification.type === "friend_request"
                                ? "te envió una solicitud de amistad"
                                : `compartió "${notification.taskTitle}" contigo`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                            {notification.type === "friend_request" && (
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleNotificationAction(notification.id, "accept")}
                                >
                                  <Check className="w-4 h-4 mr-1" /> Aceptar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleNotificationAction(notification.id, "reject")}
                                >
                                  <X className="w-4 h-4 mr-1" /> Rechazar
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/api/placeholder/32/32" alt="User" />
                        <AvatarFallback>US</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto">{renderContent()}</div>
        </main>

        {/* Active Chat */}
        {activeChat && (
          <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activeChat.avatar} alt={activeChat.name} />
                  <AvatarFallback>{activeChat.name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{activeChat.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setActiveChat(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 h-64 overflow-y-auto">
              {/* Aquí irían los mensajes del chat */}
            </div>
            <div className="p-4 border-t">
              <form className="flex items-center space-x-2">
                <Input className="flex-1" placeholder="Escribe un mensaje..." />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="fixed bottom-4 right-4 w-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export { Dashboard }