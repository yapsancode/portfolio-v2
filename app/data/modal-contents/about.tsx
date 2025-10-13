import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Code, Github, Globe } from "lucide-react";

export const aboutContent: ReactNode = (
    <motion.div
        className="space-y-6 text-gray-300"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <p className="text-lg leading-relaxed">
            Yo, welcome to my digital domain! Thanks for checking out my portfolio.
        </p>
        <p className="text-lg leading-relaxed">
            I crafted this space to flex both{" "}
            <span className="font-semibold text-blue-400">
                skills
            </span>{" "}
            and{" "}
            <span className="font-semibold text-purple-400">
                soul
            </span>
            . Think sleek, intuitive design with an Apple-inspired edge—sharp, clean,
            and straight to the point.
        </p>
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-blue-400" />
                <p>
                    Built with <span className="font-medium">Next.js</span> for a fast,
                    modern dev experience.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Github className="w-5 h-5 text-gray-400" />
                <p>
                    Pushed to{" "}
                    <a
                        href="https://github.com"
                        target="_blank"
                        className="text-blue-400 hover:underline"
                    >
                        GitHub
                    </a>{" "}
                    for version control and deployment.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-green-400" />
                <p>
                    Deployed on{" "}
                    <a
                        href="https://vercel.com"
                        target="_blank"
                        className="text-blue-400 hover:underline"
                    >
                        Vercel
                    </a>{" "}
                    for seamless hosting.
                </p>
            </div>
        </div>
        <p className="text-lg italic">
            Keeping it lean—no backend or database needed (yet). Just pure front-end
            finesse.
        </p>
    </motion.div>
);