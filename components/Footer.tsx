import { RefreshCcw } from "lucide-react";
import { QrCode } from "lucide-react";
export default function Footer() {
    return (<footer className="border-t py-12 bg-slate-50/30 dark:bg-background">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
                <img src="/tèlèclè-8.svg" alt="TeleCle" className="h-8 w-4 dark:invert dark:opacity-90 transition-all duration-200" />
                <span className="font-bold text-sm tracking-tight italic">TèlèClè</span>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-xs mb-4 leading-relaxed font-medium">
                The simplest way to bridge your physical and digital presence. 100% free and open forever.
                <br />
                <span className="text-muted-foreground/50">"MADE BY CHOUAIB"</span>
            </p>
            <a 
                href="https://www.instagram.com/out_vk/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs font-normal normal-case tracking-normal mb-8"
            >
                Talk to Developer
            </a>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50">
                <p> {new Date().getFullYear()} TeleCle. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                    <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
                </div>
            </div>
        </div>
    </footer>
        
    )
}