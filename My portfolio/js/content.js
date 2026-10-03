/* =====================================================================
   PORTFOLIO CONTENT
   ---------------------------------------------------------------------
   This is the ONLY file you need to edit to update the portfolio.
   - Leave a value as "" (empty) and the related UI hides itself.
   - Never put placeholder text here that could be mistaken for real info.
   See README.md for step-by-step examples.
   ===================================================================== */

window.PORTFOLIO = {
  /* ---------- Basic profile ---------- */
  profile: {
    name: "Hasibul Hossain",
    headline: "AI Ad Creator | Website Builder | AI Agent Developer",
    location: "Dhaka, Bangladesh",
    email: "info.hasibulhossain.support@gmail.com",
    phone: "01948564422",          // shown as written
    phoneIntl: "+8801948564422",   // used for the tap-to-call link

    // Profile photo. Put the file in assets/images/ and set the path, e.g.
    // photo: { src: "assets/images/profile.jpg", alt: "Portrait of Hasibul Hossain" }
    photo: { src: "assets/images/profile.jpg", alt: "Hasibul Hossain standing on a brick path in a navy panjabi, with greenery behind him" }
  },

  /* ---------- CV ----------
     Put your PDF in assets/cv/ and set the path, e.g. "assets/cv/Hasibul-Hossain-CV.pdf".
     While empty, the "Download CV" button stays hidden. */
  cv: "",

  /* ---------- Social links ----------
     Fill in only the ones you actually use. Empty URLs are never shown.
     Supported icons: github, linkedin, facebook, instagram, youtube, tiktok, x, behance, dribbble, link */
  socials: [
    { platform: "GitHub",    icon: "github",    url: "" },
    { platform: "LinkedIn",  icon: "linkedin",  url: "" },
    { platform: "Facebook",  icon: "facebook",  url: "" },
    { platform: "Instagram", icon: "instagram", url: "" },
    { platform: "YouTube",   icon: "youtube",   url: "" },
    { platform: "TikTok",    icon: "tiktok",    url: "" }
    // { platform: "Behance", icon: "behance", url: "https://..." },
  ],

  /* ---------- Skills ----------
     status: "active"   -> areas I already work with
             "learning" -> areas I'm actively developing */
  skills: [
    {
      category: "Creative AI",
      items: [
        { name: "AI Image Generation", status: "active", icon: "image",
          note: "Creating visuals and concept images with generative AI." },
        { name: "AI Advertisement Creation", status: "active", icon: "megaphone",
          note: "Designing ad creatives and campaign visuals with AI tools." },
        { name: "AI Video Generation", status: "learning", icon: "video",
          note: "Experimenting with AI video — still learning the craft." }
      ]
    },
    {
      category: "Web & Digital",
      items: [
        { name: "AI Website Development", status: "active", icon: "browser",
          note: "Building websites with AI-assisted development while learning the fundamentals." }
      ]
    },
    {
      category: "AI Development",
      items: [
        { name: "Prompt Engineering", status: "active", icon: "prompt",
          note: "Writing and refining prompts to get reliable, useful results." },
        { name: "Creative AI Workflows", status: "learning", icon: "flow",
          note: "Combining tools and steps into repeatable creative processes." },
        { name: "AI Agent Development", status: "learning", icon: "agent",
          note: "Learning how AI agents work and how to build personalized solutions." }
      ]
    }
  ],

  /* ---------- Experience ----------
     Independent, self-directed work. No employers, dates or numbers are invented. */
  experience: {
    role: "Independent AI Creator",
    heading: "Self-taught, project by project",
    type: "Self-directed · Independent learning & building",
    period: "Ongoing",
    summary: "I don’t have formal employment yet. Instead, I learn by doing — creating, experimenting and building on my own. These are the areas I’ve been working in.",
    tracks: [
      { title: "AI Advertisement Creation", icon: "megaphone", status: "active",
        text: "Exploring and creating AI-powered advertisements and ad visuals." },
      { title: "AI Creative Projects", icon: "image", status: "active",
        text: "Experimenting with AI image generation and developing creative digital projects." },
      { title: "AI-Assisted Web Development", icon: "browser", status: "active",
        text: "Building websites with AI-assisted development and learning how they work underneath." },
      { title: "Generative AI Exploration", icon: "spark", status: "active",
        text: "Exploring practical applications of generative AI, including early experiments with AI video." },
      { title: "AI Agent Learning", icon: "agent", status: "learning",
        text: "Learning AI agent development and how agents could power personalized AI solutions." }
    ]
  },

  /* ---------- Education ---------- */
  education: [
    {
      institution: "Government Science College",
      qualification: "Intermediate / Higher Secondary",
      period: "2025 – 2027",
      location: "Farmgate, Dhaka",
      current: true
    },
    {
      institution: "AK School",
      qualification: "SSC — Completed",
      period: "",
      location: "",
      current: false
    }
  ],

  /* ---------- Projects ----------
     Empty for now — an honest "coming soon" state is shown until real work is added.
     Copy this template for each project (remove the // ):

     {
       title: "Project title",
       description: "One or two sentences about the project.",
       category: "ai-ads",            // ai-ads | ai-visuals | websites | experiments
       media: {
         type: "image",               // "image" or "video"
         src: "assets/projects/my-ad.jpg",
         alt: "Describe what the image shows",
         poster: "",                  // for videos: a still image shown before play
         aspect: "square"             // square | portrait | story | landscape
       },
       tools: [],                     // only tools you really used, e.g. ["Midjourney"]
       details: "",                   // optional longer text shown in the details dialog
       link: { url: "", label: "" },  // optional external link
       featured: false                // true = larger card
     }
  */
  projects: [],

  projectCategories: [
    { id: "all",         label: "All" },
    { id: "ai-ads",      label: "AI Ads" },
    { id: "ai-visuals",  label: "AI Visuals" },
    { id: "websites",    label: "Websites" },
    { id: "experiments", label: "Experiments" }
  ],

  /* ---------- Achievements / certificates ----------
     The whole section (and its nav link) stays hidden while this list is empty.
     { title: "", issuer: "", date: "", image: "assets/certificates/file.jpg", link: "" } */
  achievements: [],

  /* ---------- Contact form ----------
     No email service is connected yet, so the form opens the visitor's own email app
     with the message pre-filled (it never pretends to send on its own).
     To send directly from the site, create a free form at https://formspree.io
     and paste its endpoint here, e.g. "https://formspree.io/f/abcdwxyz". */
  contactForm: {
    endpoint: ""
  }
};
