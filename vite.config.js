import { defineConfig } from "vite";
import { readFileSync, copyFileSync, existsSync } from "fs";
import { resolve } from "path";


export default defineConfig({
	server: {
		port: 3000,
		open: true,
	},
	build: {
		outDir: "dist",
		assetsDir: "assets",
		rollupOptions: {
			input: {
				main: "index.html",
			},
			external: (id) => {
				// Exclude app.js and presentation.json from build since they're dev-only
				return id.includes("app.js") || id.includes("presentation.json");
			},
		},
	},
	plugins: [
		{
			name: "inline-presentation",
			closeBundle() {
				// Copy shower.js to dist after build
				try {
					const showerSrc = resolve("node_modules/@shower/core/dist/shower.js");
					const showerDest = resolve("dist/shower.js");
					copyFileSync(showerSrc, showerDest);
					console.log("Copied shower.js to dist/");
				} catch (error) {
					console.error("Error copying shower.js:", error);
				}
			},
			transformIndexHtml: {
				enforce: "pre",
				async transform(html, context) {
					// Only transform for build, not dev
					if (context.server) {
						return html;
					}

					// Check if presentation.json exists
					if (!existsSync("presentation.json")) {
						console.warn("presentation.json not found. Building with empty presentation.");
						return html;
					}

					try {
						// Read presentation data
						const presentationData = JSON.parse(
							readFileSync("presentation.json", "utf-8")
						);

						let slidesHtml = "";
						let fontLinks = new Set();
						let allStyles = "";

						// Helper to process font properties
						const getFontFamily = (fontUrl) => {
							if (!fontUrl) return "";
							if (fontUrl.startsWith("http")) {
								fontLinks.add(fontUrl);
								try {
									const url = new URL(fontUrl);
									const family =
										url.searchParams.get("family");
									return family
										? `"${
												family.split(":")[0]
										  }", sans-serif`
										: "";
								} catch (e) {
									console.error(
										"Could not parse font family from URL:",
										e
									);
									return "";
								}
							}
							return fontUrl;
						};

						// Handle global settings
						if (presentationData.globalSettings) {
							const settings = presentationData.globalSettings;
							const globalFont = getFontFamily(settings.font);
							if (globalFont) {
								allStyles += `.shower slide * { font-family: ${globalFont} !important; }\n`;
							}
							if (settings.background) {
								const backgroundValue =
									settings.background.startsWith("http") ||
									settings.background.startsWith("/")
										? `url('${settings.background}')`
										: settings.background;
								allStyles += `.shower .slide { background: ${backgroundValue} !important; background-size: cover !important; }\n`;
							}
							if (settings.ratio) {
								allStyles += `.shower { --slide-ratio: calc(${settings.ratio}); }\n`;
							}
						}

						// Process each slide
						for (const [
							index,
							slide,
						] of presentationData.slides.entries()) {
							const slideId = `${index + 1}`;

							// Handle slide-specific styles as CSS rules
							if (slide.font) {
								const slideFont = getFontFamily(slide.font);
								if (slideFont) {
									allStyles += `.shower .slide[id='${slideId}'] * { font-family: ${slideFont} !important; }\n`;
								}
							}
							if (slide.background) {
								const backgroundValue =
									slide.background.startsWith("http") ||
									slide.background.startsWith("/")
										? `url('${slide.background}')`
										: slide.background;
								allStyles += `.shower .slide[id='${slideId}'] { background: ${backgroundValue} !important; background-size: cover !important; }\n`;
							}

							// Generate slide HTML using original simple template functions
							const templatePath = resolve(
								`templates/${slide.type}.js`
							);
							const templateModule = await import(
								`file://${templatePath}`
							);
							const createSlide = templateModule.default;
							slidesHtml += createSlide(slide.data, slideId);
						}

						// Prepare styles and links for injection
						const fontLinkTags = [...fontLinks]
							.map(
								(href) =>
									`<link rel="stylesheet" href="${href}">`
							)
							.join("\n");
						const styleTag = allStyles.trim()
							? `<style>${allStyles}</style>`
							: "";

						// Replace placeholders in HTML
						return html
							.replace(
								"<h1></h1>",
								`<h1>${presentationData.title}</h1>`
							)
							.replace(
								"<title>Shower Presentation Engine</title>",
								`<title>${presentationData.title}</title>`
							)
							.replace("<!-- SLIDES_PLACEHOLDER -->", slidesHtml)
							.replace(
								'<script type="module" src="app.js"></script>',
								'<script src="/shower.js"></script>'
							)
							.replace(
								"</head>",
								`${fontLinkTags}\n${styleTag}\n</head>`
							)
							.replace(
								'<body class="shower list">',
								'<body class="shower full">'
							);
					} catch (error) {
						console.error(
							"Error generating static presentation:",
							error
						);
						return html;
					}
				},
			},
		},
	],
});
