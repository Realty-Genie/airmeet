"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
    IconUser,
    IconMail,
    IconPhone,
    IconPlus,
    IconUpload,
    IconPhoto,
    IconX,
    IconBolt,
    IconFileSpreadsheet,
    IconDownload,
    IconDeviceFloppy,
} from "@tabler/icons-react"
import * as XLSX from "xlsx"

interface CreateBatchCallModalProps {
    trigger?: React.ReactNode
}

interface Lead {
    name: string
    phNo: string
    email: string
}

export function CreateBatchCallModal({ trigger }: CreateBatchCallModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [leads, setLeads] = useState<Lead[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isProcessingImage, setIsProcessingImage] = useState(false)
    const [triggerTimestamp, setTriggerTimestamp] = useState("")

    // Manual entry state
    const [manualEntry, setManualEntry] = useState({
        name: "",
        email: "",
        phone: "",
    })

    const fileInputRef = useRef<HTMLInputElement>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)

    const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setManualEntry((prev) => ({
            ...prev,
            [id.replace("manual-", "")]: value,
        }))
    }

    const addManualLead = () => {
        if (!manualEntry.phone.trim()) {
            toast.error("Phone number is required")
            return
        }
        setLeads((prev) => [
            ...prev,
            {
                name: manualEntry.name || "Unknown",
                phNo: manualEntry.phone,
                email: manualEntry.email,
            },
        ])
        setManualEntry({ name: "", email: "", phone: "" })
    }

    const removeLead = (index: number) => {
        setLeads((prev) => prev.filter((_, i) => i !== index))
    }

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const data = event.target?.result
                const workbook = XLSX.read(data, { type: "binary" })
                const sheetName = workbook.SheetNames[0]
                const sheet = workbook.Sheets[sheetName]
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false }) as string[][]

                const parsedLeads: Lead[] = []
                jsonData.forEach((row, index) => {
                    if (index === 0) return // Skip header row
                    if (row.length >= 1) {
                        parsedLeads.push({
                            name: row[0] || "Unknown",
                            phNo: String(row[1] || row[0] || ""),
                            email: row[2] || "",
                        })
                    }
                })

                if (parsedLeads.length > 0) {
                    setLeads((prev) => [...prev, ...parsedLeads])
                    toast.success(`Added ${parsedLeads.length} leads from file`)
                } else {
                    toast.error("No valid leads found in file")
                }
            } catch (error) {
                toast.error("Failed to parse file")
            }
        }
        reader.readAsBinaryString(file)
        e.target.value = "" // Reset input
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsProcessingImage(true)
        try {
            // Convert image to base64
            const reader = new FileReader()
            reader.onload = async (event) => {
                const base64Data = event.target?.result as string
                const base64Image = base64Data.split(",")[1]

                try {
                    // Call Gemini API directly for image processing
                    const response = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                contents: [
                                    {
                                        parts: [
                                            {
                                                text: `Extract all contact information from this image. Look for names, phone numbers, and email addresses. Return the data as a JSON array with objects containing "name", "phone", and "email" fields. If a field is not found, use an empty string. Only return the JSON array, nothing else. Example format: [{"name": "John Doe", "phone": "+1234567890", "email": "john@example.com"}]`,
                                            },
                                            {
                                                inline_data: {
                                                    mime_type: file.type,
                                                    data: base64Image,
                                                },
                                            },
                                        ],
                                    },
                                ],
                            }),
                        }
                    )

                    if (response.ok) {
                        const data = await response.json()
                        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

                        // Parse JSON from response
                        const jsonMatch = text.match(/\[[\s\S]*\]/)
                        if (jsonMatch) {
                            const extractedLeads = JSON.parse(jsonMatch[0])
                            const formattedLeads: Lead[] = extractedLeads.map((lead: { name?: string; phone?: string; email?: string }) => ({
                                name: lead.name || "Unknown",
                                phNo: lead.phone || "",
                                email: lead.email || "",
                            }))

                            if (formattedLeads.length > 0) {
                                setLeads((prev) => [...prev, ...formattedLeads])
                                toast.success(`Extracted ${formattedLeads.length} leads from image`)
                            } else {
                                toast.error("No contacts found in image")
                            }
                        } else {
                            toast.error("Could not extract contacts from image")
                        }
                    } else {
                        toast.error("Failed to process image")
                    }
                } catch (error) {
                    console.error("OCR Error:", error)
                    toast.error("Failed to process image")
                }
                setIsProcessingImage(false)
            }
            reader.readAsDataURL(file)
        } catch (error) {
            toast.error("Failed to read image file")
            setIsProcessingImage(false)
        }
        e.target.value = "" // Reset input
    }

    const saveList = () => {
        if (leads.length === 0) {
            toast.error("No leads to save")
            return
        }
        localStorage.setItem("savedLeads", JSON.stringify(leads))
        toast.success("List saved successfully")
    }

    const loadSaved = () => {
        const saved = localStorage.getItem("savedLeads")
        if (saved) {
            const loadedLeads = JSON.parse(saved) as Lead[]
            setLeads(loadedLeads)
            toast.success(`Loaded ${loadedLeads.length} leads`)
        } else {
            toast.error("No saved list found")
        }
    }

    const handleBatchCall = async () => {
        if (leads.length === 0) {
            toast.error("No leads to call")
            return
        }

        setIsLoading(true)
        try {
            const token = localStorage.getItem("airmeet_token")
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/call/batchCall`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    leads: leads.map((l) => ({
                        name: l.name,
                        phNo: l.phNo,
                        email: l.email,
                    })),
                    ...(triggerTimestamp && { triggerTimestamp: parseInt(triggerTimestamp) }),
                }),
            })

            if (response.ok) {
                toast.success(`Successfully initiated batch call for ${leads.length} leads`)
                setLeads([])
                setTriggerTimestamp("")
                setIsOpen(false)
            } else {
                toast.error("Failed to initiate batch call")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="flex items-center gap-2">
                        <IconBolt className="h-4 w-4" />
                        Batch Call
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <IconBolt className="h-4 w-4 text-primary" />
                        </div>
                        Create Batch Call
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="manual" className="flex items-center gap-2 text-sm">
                            <IconUser className="h-4 w-4" />
                            <span className="hidden sm:inline">Manual</span>
                        </TabsTrigger>
                        <TabsTrigger value="csv" className="flex items-center gap-2 text-sm">
                            <IconFileSpreadsheet className="h-4 w-4" />
                            <span className="hidden sm:inline">CSV / Excel</span>
                        </TabsTrigger>
                        <TabsTrigger value="image" className="flex items-center gap-2 text-sm">
                            <IconPhoto className="h-4 w-4" />
                            <span className="hidden sm:inline">Image</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Manual Tab */}
                    <TabsContent value="manual" className="space-y-4 mt-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <IconPlus className="h-4 w-4" />
                            ADD NEW LEAD
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="relative">
                                <IconUser className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="manual-name"
                                    placeholder="Name"
                                    className="pl-9"
                                    value={manualEntry.name}
                                    onChange={handleManualChange}
                                />
                            </div>
                            <div className="relative">
                                <IconMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="manual-email"
                                    placeholder="Email (Optional)"
                                    className="pl-9"
                                    value={manualEntry.email}
                                    onChange={handleManualChange}
                                />
                            </div>
                            <div className="relative">
                                <IconPhone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="manual-phone"
                                    placeholder="Phone (+1...)"
                                    className="pl-9"
                                    value={manualEntry.phone}
                                    onChange={handleManualChange}
                                />
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={addManualLead}
                        >
                            <IconPlus className="h-4 w-4 mr-2" />
                            Add to List
                        </Button>

                        <p className="text-xs text-destructive">
                            * Phone number is required to add a lead
                        </p>
                    </TabsContent>

                    {/* CSV Tab */}
                    <TabsContent value="csv" className="space-y-4 mt-4">
                        <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-4">
                            {/* Format Instructions */}
                            <div className="bg-muted/50 p-3 rounded-md text-sm text-center max-w-sm space-y-1">
                                <p className="font-semibold text-muted-foreground mb-2">Required File Format:</p>
                                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                                    <div className="bg-background border rounded px-2 py-1">Name</div>
                                    <div className="bg-background border rounded px-2 py-1">Phone</div>
                                    <div className="bg-background border rounded px-2 py-1">Email</div>
                                </div>
                                <p className="text-xs text-muted-foreground pt-1">
                                    First row is skipped as header. Order matters.
                                </p>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <Button
                                    variant="outline"
                                    onClick={loadSaved}
                                    className="border-border"
                                >
                                    <IconDownload className="h-4 w-4 mr-2" />
                                    Load Saved
                                </Button>
                                <Button onClick={saveList}>
                                    <IconDeviceFloppy className="h-4 w-4 mr-2" />
                                    Save List
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                className="hidden"
                                onChange={handleCSVUpload}
                            />
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <IconUpload className="h-4 w-4 mr-2" />
                                Upload CSV/Excel
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Image Tab */}
                    <TabsContent value="image" className="space-y-4 mt-4">
                        <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-4 text-center">
                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                                <IconPhoto className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="font-medium">Upload Image of Leads</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Upload a photo of a handwritten or printed list. AI will extract names, emails, phones, and addresses.
                                </p>
                            </div>
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                            <Button
                                onClick={() => imageInputRef.current?.click()}
                                disabled={isProcessingImage}
                                variant="default"
                            >
                                {isProcessingImage ? (
                                    "Processing..."
                                ) : (
                                    <>
                                        <IconUpload className="h-4 w-4 mr-2" />
                                        Select Image
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Leads Preview */}
                {leads.length > 0 && (
                    <div className="space-y-3 mt-4">
                        <div className="flex items-center justify-between">
                            <Label>Added Leads ({leads.length})</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLeads([])}
                                className="text-xs text-muted-foreground h-auto py-1"
                            >
                                Clear all
                            </Button>
                        </div>
                        <div className="max-h-[150px] overflow-y-auto space-y-2 rounded-lg border p-3 bg-muted/30">
                            {leads.map((lead, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-background rounded-md px-3 py-2 text-sm"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <IconPhone className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{lead.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {lead.phNo}
                                                {lead.email && ` • ${lead.email}`}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0"
                                        onClick={() => removeLead(index)}
                                    >
                                        <IconX className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trigger Timestamp */}
                <div className="space-y-2 mt-4">
                    <Label htmlFor="triggerTimestamp">Delay in minutes (Optional)</Label>
                    <Input
                        id="triggerTimestamp"
                        type="number"
                        placeholder="Delay in minutes"
                        value={triggerTimestamp}
                        onChange={(e) => setTriggerTimestamp(e.target.value)}
                    />
                </div>

                {/* Submit Button */}
                <Button
                    onClick={handleBatchCall}
                    disabled={leads.length === 0 || isLoading}
                    className="w-full mt-4"
                    size="lg"
                >
                    <IconBolt className="h-4 w-4 mr-2" />
                    {isLoading
                        ? "Processing..."
                        : `Call ${leads.length} Selected Lead${leads.length !== 1 ? "s" : ""}`}
                </Button>
            </DialogContent>
        </Dialog>
    )
}
