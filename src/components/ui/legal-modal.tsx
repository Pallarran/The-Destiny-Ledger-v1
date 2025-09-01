import { useState } from 'react'
import { Button } from './button'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './dialog'
import { ScrollText } from 'lucide-react'

export function LegalModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ScrollText className="h-4 w-4" />
          Legal & Licensing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Legal Notice & Licensing Information</DialogTitle>
          <DialogDescription>
            Information about the content and licensing used in The Destiny Ledger
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 text-sm">
          <div>
            <h3 className="font-semibold mb-2">System Reference Document 5.1</h3>
            <p className="text-muted-foreground">
              This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") 
              by Wizards of the Coast LLC. The SRD 5.1 is licensed under the Creative Commons 
              Attribution 4.0 International License (CC-BY-4.0).
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Creative Commons Attribution 4.0</h3>
            <p className="text-muted-foreground mb-2">
              You are free to:
            </p>
            <ul className="list-disc ml-6 text-muted-foreground space-y-1">
              <li><strong>Share</strong> — copy and redistribute the material in any medium or format</li>
              <li><strong>Adapt</strong> — remix, transform, and build upon the material for any purpose, even commercially</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Under the following terms: <strong>Attribution</strong> — You must give appropriate credit, 
              provide a link to the license, and indicate if changes were made.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">5e Compatibility</h3>
            <p className="text-muted-foreground">
              This application is compatible with 5e rules and designed for use with the 2014 rules edition. 
              No Product Identity content from Wizards of the Coast is included.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Attribution</h3>
            <p className="text-muted-foreground">
              The Destiny Ledger uses game mechanics and content from the SRD 5.1, available at{' '}
              <a 
                href="https://dnd.wizards.com/resources/systems-reference-document"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                dnd.wizards.com/resources/systems-reference-document
              </a>
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              This notice is required by the CC-BY-4.0 license and ensures proper attribution 
              to Wizards of the Coast LLC for the SRD 5.1 content used in this application.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}