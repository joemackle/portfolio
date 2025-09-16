import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import yaml from "js-yaml";

import pluginFilters from "./_config/filters.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {
	eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

	// Drafts, see also _data/eleventyDataSchema.js
	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		if(data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
			return false;
		}
	});

	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig
		.addPassthroughCopy({
			"./public/": "/"
		})
		.addPassthroughCopy("./content/feed/pretty-atom-feed.xsl");

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");

	// Per-page bundles, see https://github.com/11ty/eleventy-plugin-bundle
	// Adds the {% css %} paired shortcode
	eleventyConfig.addBundle("css", {
		toFileDirectory: "dist",
	});
	// Adds the {% js %} paired shortcode
	eleventyConfig.addBundle("js", {
		toFileDirectory: "dist",
	});

	// Official plugins
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 }
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", // or "rss", "json"
		outputPath: "/feed/feed.xml",
		stylesheet: "pretty-atom-feed.xsl",
		templateData: {
			eleventyNavigation: {
				key: "Feed",
				order: 4
			}
		},
		collection: {
			name: "posts",
			limit: 10,
		},
		metadata: {
			language: "en",
			title: "unnamed blog",
			subtitle: "undefined description",
			base: "https://joemackle.com/",
			author: {
				name: "Joe Mackle"
			}
		}
	});

	// Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// Output formats for each image.
		formats: ["avif", "webp", "auto"],

		// widths: ["auto"],

		failOnError: false,
		htmlOptions: {
			imgAttributes: {
				// e.g. <img loading decoding> assigned on the HTML tag will override these values.
				loading: "lazy",
				decoding: "async",
			}
		},

		sharpOptions: {
			animated: true,
		},
	});

	// Filters
	eleventyConfig.addPlugin(pluginFilters);

	eleventyConfig.addPlugin(IdAttributePlugin, {
		// by default we use Eleventy’s built-in `slugify` filter:
		// slugify: eleventyConfig.getFilter("slugify"),
		// selector: "h1,h2,h3,h4,h5,h6", // default
	});

	// Shortcodes

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return (new Date()).toDateString();
	});

	// Chords
	eleventyConfig.addShortcode("chord", function(chordId) {
		const chord = this.ctx.chords?.[chordId];
		if (!chord) return `<em>Chord not found: ${chordId}</em>`;

		const frets = chord.fingering.frets;

		const VB_W = 160, VB_H = 200;
		const INSET = 0.5;
		const R = 10;

		let svg = `<svg viewBox="0 0 ${VB_W} ${VB_H}" width="100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${chord.name}">
			<style>
				.grid { stroke: #333; stroke-width: 1 }
				.grid-thick { stroke: #333; stroke-width: 3 }
				.dot { fill: #333 }
				.open { fill: none; stroke: #333; stroke-width: 2 }
				.mute { font: 18px sans-serif; text-anchor: middle }
				.label { font: 20px sans-serif; text-anchor: middle }
				.frame { fill: white; stroke: #333; stroke-width: 1 }
			</style>
			<rect class="frame" x="${INSET}" y="${INSET}" width="${VB_W - 2*INSET}" height="${VB_H - 2*INSET}" rx="${R}" ry="${R}" />
			<text x="${VB_W/2}" y="30" class="label">${chord.name}</text>
		`;

		// draw strings
		for (let i = 0; i < 6; i++) {
			const x = 30 + i * 20;
			svg += `<line class="grid" x1="${x}" y1="60" x2="${x}" y2="180" />`;
		}

		// draw frets
		for (let i = 0; i < 6; i++) {
			const y = 60 + i * 24;
			svg += `<line class="${i === 0 && chord.position === 1 ? "grid-thick" : "grid"}" x1="30" y1="${y}" x2="130" y2="${y}" />`;
		}

		// fret number
		if (chord.position !== 1) {
			svg += `<text x="140" y="76">${chord.position}</text>`;
		}

		// draw dots
		frets.forEach((f, i) => {
			const x = 30 + i * 20;
			if (f === "x") {  // mute
				svg += `<text class="mute" x="${x}" y="55">x</text>`;
			} else if (f === 0) {  // open
				svg += `<circle class="open" cx="${x}" cy="50" r="4" />`;
			} else if (typeof f === "number") {  // pressed
				const y = 60 + (f-chord.position+0.5) * 24;
				svg += `<circle class="dot" cx="${x}" cy="${y}" r="6" />`;
			}
		});

		svg += "</svg>";
		return svg;
	});

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
};

export const config = {
	// Control which files Eleventy will process
	// e.g.: *.md, *.njk, *.html, *.liquid
	templateFormats: [
		"md",
		"njk",
		"html",
		"liquid",
		"11ty.js",
	],

	// Pre-process *.md files with: (default: `liquid`)
	markdownTemplateEngine: "njk",

	// Pre-process *.html files with: (default: `liquid`)
	htmlTemplateEngine: "njk",

	// These are all optional:
	dir: {
		input: "content",          // default: "."
		includes: "../_includes",  // default: "_includes" (`input` relative)
		data: "../_data",          // default: "_data" (`input` relative)
		output: "_site"
	},

	// -----------------------------------------------------------------
	// Optional items:
	// -----------------------------------------------------------------

	// If your site deploys to a subdirectory, change `pathPrefix`.
	// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

	// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
	// it will transform any absolute URLs in your HTML to include this
	// folder name and does **not** affect where things go in the output folder.

	pathPrefix: "/",
};
