"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { format } from "date-fns"

interface Lead {
  _id: string
  name: string
  phNo: string
  email?: string
  createdAt: string
}

export default function Page() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lead/allLeads`)
        if (response.ok) {
          const data = await response.json()
          setLeads(data.leads || [])
        } else {
          toast.error("Failed to fetch leads")
        }
      } catch (error) {
        toast.error("Error connecting to server")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeads()
  }, [])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-gradient-mesh">
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>
                A list of all leads captured by the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">Loading leads...</div>
              ) : leads.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">No leads found.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow
                        key={lead._id}
                        onClick={() => router.push(`/lead/${lead._id}`)}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.phNo}</TableCell>
                        <TableCell>
                          {lead.createdAt ? format(new Date(lead.createdAt), "PPP p") : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
