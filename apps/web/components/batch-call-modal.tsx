"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet"
import { toast } from "sonner"
import { IconUsers, IconUpload, IconPhone, IconX, IconCheck } from "@tabler/icons-react"

interface BatchCallModalProps {
    trigger?: React.ReactNode
}

interface PhoneEntry {
    name: string
    phone: string
    email?: string
}

export function BatchCallModal({ trigger }: BatchCallModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [phoneNumbers, setPhoneNumbers] = useState("")
    const [parsedEntries, setParsedEntries] = useState<PhoneEntry[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const parsePhoneNumbers = (text: string) => {
        const lines = text.split("\n").filter((line) => line.trim())
        const entries: PhoneEntry[] = lines.map((line) => {
            const parts = line.split(",").map((p) => p.trim())
            return {
                name: parts[0] || "Unknown",
                phone: parts[1] || parts[0] || "",
                email: parts[2] || undefined,
            }
        })
        setParsedEntries(entries)
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value
        setPhoneNumbers(text)
        parsePhoneNumbers(text)
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            setPhoneNumbers(text)
            parsePhoneNumbers(text)
        }
        reader.readAsText(file)
    }

    const handleBatchCall = async () => {
        if (parsedEntries.length === 0) {
            toast.error("No phone numbers to call")
            return
        }

        setIsLoading(true)
        try {
            // Call createCall API for each entry
            let successCount = 0
            let failCount = 0

            for (const entry of parsedEntries) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/call/createCall`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: entry.name,
                            phNo: entry.phone,
                            email: entry.email || "",
                        }),
                    })

                    if (response.ok) {
                        successCount++
                    } else {
                        failCount++
                    }
                } catch {
                    failCount++
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully initiated ${successCount} calls`)
            }
            if (failCount > 0) {
                toast.warning(`Failed to initiate ${failCount} calls`)
            }

            // Reset and close
            setPhoneNumbers("")
            setParsedEntries([])
            setIsOpen(false)
        } catch (error) {
            toast.error("An error occurred while processing batch calls")
        } finally {
            setIsLoading(false)
        }
    }

    const removeEntry = (index: number) => {
        const newEntries = parsedEntries.filter((_, i) => i !== index)
        setParsedEntries(newEntries)
        // Update textarea
        const newText = newEntries.map((e) => `${e.name}, ${e.phone}${e.email ? `, ${e.email}` : ""}`).join("\n")
        setPhoneNumbers(newText)
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="flex items-center gap-2">
                        <IconUsers className="h-4 w-4" />
                        Batch Calls
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <IconUsers className="h-5 w-5 text-primary" />
                        Batch Call
                    </SheetTitle>
                    <SheetDescription>
                        Upload a CSV or paste phone numbers to initiate multiple calls at once.
                        Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">ESC</kbd> to close.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-6">
                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="csv-upload">Upload CSV File</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="csv-upload"
                                type="file"
                                accept=".csv,.txt"
                                onChange={handleFileUpload}
                                className="cursor-pointer"
                            />
                            <IconUpload className="h-5 w-5 text-muted-foreground shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            CSV format: Name, Phone, Email (optional)
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <Separator className="flex-1" />
                    </div>

                    {/* Manual Entry */}
                    <div className="space-y-2">
                        <Label htmlFor="phone-numbers">Paste Phone Numbers</Label>
                        <textarea
                            id="phone-numbers"
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            placeholder="John Doe, +919876543210, john@email.com&#10;Jane Smith, +919876543211&#10;..."
                            value={phoneNumbers}
                            onChange={handleTextChange}
                        />
                    </div>

                    {/* Preview */}
                    {parsedEntries.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Preview ({parsedEntries.length} entries)</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setPhoneNumbers("")
                                        setParsedEntries([])
                                    }}
                                    className="text-xs text-muted-foreground h-auto py-1"
                                >
                                    Clear all
                                </Button>
                            </div>
                            <div className="max-h-[200px] overflow-y-auto space-y-2 rounded-lg border p-3 bg-muted/30">
                                {parsedEntries.map((entry, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-background rounded-md px-3 py-2 text-sm"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <IconPhone className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{entry.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {entry.phone}
                                                    {entry.email && ` • ${entry.email}`}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0"
                                            onClick={() => removeEntry(index)}
                                        >
                                            <IconX className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <SheetFooter>
                    <Button
                        onClick={handleBatchCall}
                        disabled={parsedEntries.length === 0 || isLoading}
                        className="w-full"
                        size="lg"
                    >
                        {isLoading ? (
                            "Processing..."
                        ) : (
                            <>
                                <IconCheck className="h-4 w-4 mr-2" />
                                Start {parsedEntries.length} Call{parsedEntries.length !== 1 ? "s" : ""}
                            </>
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
