import mongoose from "mongoose"
import { Post } from "./models/Post.mjs"
import { Community } from "./models/Community.mjs"
import { Member } from "./models/Member.mjs"
import { Comment } from "./models/Comment.mjs"
import { Notification } from "./models/Notification.mjs"
import { Like } from "./models/Like.mjs"

export async function seedCommunityData() {
  const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/white_quantex_social"
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoURI)
  }

  console.log("[Seed] Checking existing community data...")

  const postCount = await Post.countDocuments()
  const commCount = await Community.countDocuments()
  const memberCount = await Member.countDocuments()

  if (postCount > 0 && commCount > 0 && memberCount > 0) {
    console.log(`[Seed] Data already populated: ${postCount} posts, ${commCount} hubs, ${memberCount} members.`)
    return
  }

  console.log("[Seed] Seeding fresh community records...")

  // 1. Seed Community Hubs
  let hubs = await Community.find().lean()
  if (hubs.length === 0) {
    hubs = await Community.insertMany([
      {
        name: "AI & Machine Learning Founders",
        slug: "ai-ml-founders",
        description: "Collaborative hub for enterprise neural inference, distributed LLM deployment, and AI hardware acceleration.",
        coverImageUrl: "",
        iconUrl: "",
        memberCount: 1420,
        postCount: 84,
        isPrivate: false,
        createdByWqUserId: "wq-user-elena-voss",
        categories: ["AI & ML", "DeepTech"],
        rules: ["Peer-to-peer technical discussions only", "No promotional spam without audited benchmark citations"],
        members: ["wq-uuid-demo-author", "wq-user-elena-voss"],
      },
      {
        name: "CleanTech & Autonomous Energy",
        slug: "cleantech-energy",
        description: "Direct discussions among founders and infrastructure allocators building microgrids, grid batteries, and synthetic fuel cells.",
        coverImageUrl: "",
        iconUrl: "",
        memberCount: 980,
        postCount: 42,
        isPrivate: false,
        createdByWqUserId: "wq-user-marcus-klein",
        categories: ["CleanTech", "Energy"],
        rules: ["Focus on scalable commercial energy transition", "Respect verified proprietary patents"],
        members: ["wq-user-marcus-klein"],
      },
      {
        name: "Sovereign Fintech & Payment Rails",
        slug: "sovereign-fintech",
        description: "ISO-20022 messaging, real-time treasury clearing, private escrow settlement, and multi-currency capital liquidity.",
        coverImageUrl: "",
        iconUrl: "",
        memberCount: 1150,
        postCount: 65,
        isPrivate: false,
        createdByWqUserId: "wq-uuid-demo-author",
        categories: ["Fintech", "Banking"],
        rules: ["Strict adherence to financial confidentiality and AML/KYC guidelines"],
        members: ["wq-uuid-demo-author", "wq-user-sarah-chen"],
      },
      {
        name: "BioTech & Precision Therapeutics",
        slug: "biotech-therapeutics",
        description: "CRISPR mRNA carriers, automated surgical robotics, enzymatic DNA synthesis, and FDA statutory regulatory paths.",
        coverImageUrl: "",
        iconUrl: "",
        memberCount: 740,
        postCount: 38,
        isPrivate: false,
        createdByWqUserId: "wq-user-aris-thorne",
        categories: ["Biotech", "HealthTech"],
        rules: ["Cite verified clinical phase milestones", "Scientific rigor expected"],
        members: ["wq-user-aris-thorne"],
      },
      {
        name: "SpaceTech & Defense Innovators",
        slug: "spacetech-defense",
        description: "LEO telemetry constellations, post-quantum lattice cryptography, ion propulsion, and commercial aerospace logistics.",
        coverImageUrl: "",
        iconUrl: "",
        memberCount: 890,
        postCount: 51,
        isPrivate: false,
        createdByWqUserId: "wq-user-vikram-seth",
        categories: ["SpaceTech", "Defense"],
        rules: ["ITAR / statutory compliance observed at all times"],
        members: ["wq-user-vikram-seth"],
      },
      {
        name: "Delaware Statutory Corporate Issuers",
        slug: "delaware-issuers",
        description: "Private secondary liquidity, corporate governance, investor relations, 409A valuations, and cap table management.",
        coverImageUrl: "",
        iconUrl: "",
        memberCount: 1650,
        postCount: 112,
        isPrivate: false,
        createdByWqUserId: "wq-uuid-demo-author",
        categories: ["Corporate", "Secondary"],
        rules: ["Delaware C-Corps verified issuers only"],
        members: ["wq-uuid-demo-author"],
      },
    ])
    console.log(`[Seed] Created ${hubs.length} community hubs.`)
  }

  // 2. Seed Ecosystem Members (Founders & Investors)
  if (memberCount === 0) {
    await Member.insertMany([
      {
        wqUserId: "wq-user-elena-voss",
        name: "Elena Voss",
        username: "elenavoss",
        headline: "Founder & CEO @ NovaMind AI",
        bio: "Pioneering ultra-low latency distributed neural inference architectures for enterprise multi-cloud environments.",
        role: "FOUNDER",
        location: "San Francisco, CA",
        followersCount: 14200,
        followingCount: 420,
        verificationLevel: "GOLD",
        trustScore: 98,
        portfolioOrVenture: "NovaMind AI (Series A)",
      },
      {
        wqUserId: "wq-user-marcus-klein",
        name: "Marcus Klein",
        username: "marcusklein",
        headline: "CEO @ VerdeGrid Energy",
        bio: "Decentralized microgrid battery dispatch contracts and industrial energy optimization systems.",
        role: "FOUNDER",
        location: "Berlin, Germany",
        followersCount: 8900,
        followingCount: 310,
        verificationLevel: "SILVER",
        trustScore: 92,
        portfolioOrVenture: "VerdeGrid Energy Systems",
      },
      {
        wqUserId: "wq-user-aris-thorne",
        name: "Dr. Aris Thorne",
        username: "aristhorne",
        headline: "Founder @ MediSync Robotics",
        bio: "Sub-millimeter haptic feedback and computer-vision tumor boundary mapping for precision laparoscopic surgery.",
        role: "FOUNDER",
        location: "Boston, MA",
        followersCount: 11400,
        followingCount: 280,
        verificationLevel: "PLATINUM",
        trustScore: 96,
        portfolioOrVenture: "MediSync Robotics Corp",
      },
      {
        wqUserId: "wq-user-vikram-seth",
        name: "Vikram Seth",
        username: "vikramseth",
        headline: "Founder @ OmniLogic NeuroTech",
        bio: "Non-invasive EEG spatial telemetry and cognitive load monitoring for high-stress aerospace operators.",
        role: "FOUNDER",
        location: "Pittsburgh, PA",
        followersCount: 7600,
        followingCount: 195,
        verificationLevel: "GOLD",
        trustScore: 91,
        portfolioOrVenture: "OmniLogic NeuroTech Ltd",
      },
      {
        wqUserId: "wq-user-sarah-chen",
        name: "Sarah Chen",
        username: "sarahchen",
        headline: "General Partner @ Sequoia Capital",
        bio: "Investing in next-generation enterprise infrastructure, sovereign fintech rails, and quantum materials.",
        role: "INVESTOR",
        location: "Menlo Park, CA",
        followersCount: 24500,
        followingCount: 680,
        verificationLevel: "PLATINUM",
        trustScore: 99,
        portfolioOrVenture: "Sequoia Capital",
      },
      {
        wqUserId: "wq-user-david-kim",
        name: "David Kim",
        username: "davidkim",
        headline: "Managing Director @ Founders Fund",
        bio: "Focus on frontier deep-tech, commercial space commercialization, and sovereign secondary liquidity.",
        role: "INVESTOR",
        location: "New York, NY",
        followersCount: 18900,
        followingCount: 540,
        verificationLevel: "GOLD",
        trustScore: 97,
        portfolioOrVenture: "Founders Fund",
      },
      {
        wqUserId: "wq-uuid-demo-author",
        name: "Alexander Vance",
        username: "alexvance",
        headline: "Managing Partner · Quantex Sovereign Capital",
        bio: "Accredited institutional investor specializing in AI inference infrastructure, orbital robotics, and quantum computing.",
        role: "INVESTOR",
        location: "San Francisco, CA",
        followersCount: 31200,
        followingCount: 410,
        verificationLevel: "PLATINUM",
        trustScore: 99,
        portfolioOrVenture: "Quantex Sovereign Capital",
      },
      {
        wqUserId: "wq-user-claire-dupont",
        name: "Claire Dupont",
        username: "clairedupont",
        headline: "Partner @ European Tech Horizons",
        bio: "Backing deep-tech European and US Delaware entities expanding cross-border operations.",
        role: "INVESTOR",
        location: "Paris, France",
        followersCount: 12400,
        followingCount: 380,
        verificationLevel: "GOLD",
        trustScore: 94,
        portfolioOrVenture: "European Tech Horizons",
      },
    ])
    console.log("[Seed] Created 8 ecosystem network members.")
  }

  // 3. Seed Posts
  if (postCount === 0) {
    const aiHub = hubs.find((h) => h.slug === "ai-ml-founders")?._id?.toString()
    const cleanHub = hubs.find((h) => h.slug === "cleantech-energy")?._id?.toString()
    const fintechHub = hubs.find((h) => h.slug === "sovereign-fintech")?._id?.toString()
    const spaceHub = hubs.find((h) => h.slug === "spacetech-defense")?._id?.toString()

    const createdPosts = await Post.insertMany([
      {
        wqAuthorId: "wq-user-elena-voss",
        authorName: "Elena Voss",
        authorUsername: "elenavoss",
        authorHeadline: "Founder & CEO @ NovaMind AI",
        authorRole: "FOUNDER",
        authorVerificationLevel: "GOLD",
        content: "Excited to share that NovaMind AI has officially crossed 100k daily active inference requests! Huge milestone for our engineering team. Thank you to the White Quantex founder network for early feedback during our closed beta.",
        postType: "IMAGE",
        visibility: "PUBLIC",
        communityId: aiHub,
        hashtags: ["AI", "Milestone", "Enterprise"],
        likesCount: 142,
        commentsCount: 28,
        sharesCount: 12,
        bookmarksCount: 34,
        createdAt: new Date(Date.now() - 2 * 3600000),
      },
      {
        wqAuthorId: "wq-user-marcus-klein",
        authorName: "Marcus Klein",
        authorUsername: "marcusklein",
        authorHeadline: "CEO @ VerdeGrid Energy",
        authorRole: "FOUNDER",
        authorVerificationLevel: "SILVER",
        content: "VerdeGrid Energy just completed our autonomous grid-tie microgrid synchronization in Denver. Generating 2.4 MWh continuous capacity with zero grid downtime during peak commercial pricing windows. Decentralized battery energy storage is the future of clean manufacturing.",
        postType: "TEXT",
        visibility: "PUBLIC",
        communityId: cleanHub,
        hashtags: ["CleanTech", "Energy", "Microgrid"],
        likesCount: 98,
        commentsCount: 16,
        sharesCount: 9,
        bookmarksCount: 21,
        createdAt: new Date(Date.now() - 5 * 3600000),
      },
      {
        wqAuthorId: "wq-user-sarah-chen",
        authorName: "Sarah Chen",
        authorUsername: "sarahchen",
        authorHeadline: "General Partner @ Sequoia Capital",
        authorRole: "INVESTOR",
        authorVerificationLevel: "PLATINUM",
        content: "Private secondary liquidity for Delaware C-Corps is undergoing a generational inflection. High-growth enterprise software firms are staying private longer while commanding premium revenue multiples. Here is our Q3 venture market breakdown on liquidity dynamics and capital retention.",
        postType: "TEXT",
        visibility: "PUBLIC",
        communityId: fintechHub,
        hashtags: ["VentureCapital", "PrivateSecondary", "Valuation"],
        likesCount: 264,
        commentsCount: 42,
        sharesCount: 38,
        bookmarksCount: 89,
        createdAt: new Date(Date.now() - 9 * 3600000),
      },
      {
        wqAuthorId: "wq-user-aris-thorne",
        authorName: "Dr. Aris Thorne",
        authorUsername: "aristhorne",
        authorHeadline: "Founder @ MediSync Robotics",
        authorRole: "FOUNDER",
        authorVerificationLevel: "PLATINUM",
        content: "Our sub-millimeter surgical robotics platform completed its 500th phantom-tissue trial with 99.8% computer-vision boundary precision. Preparing our FDA 510(k) statutory submission dossier next month with milestone backing from our Delaware syndicate.",
        postType: "TEXT",
        visibility: "PUBLIC",
        communityId: null,
        hashtags: ["Biotech", "Robotics", "HealthTech"],
        likesCount: 118,
        commentsCount: 22,
        sharesCount: 14,
        bookmarksCount: 45,
        createdAt: new Date(Date.now() - 14 * 3600000),
      },
      {
        wqAuthorId: "wq-user-vikram-seth",
        authorName: "Vikram Seth",
        authorUsername: "vikramseth",
        authorHeadline: "Founder @ OmniLogic NeuroTech",
        authorRole: "FOUNDER",
        authorVerificationLevel: "GOLD",
        content: "Non-invasive dry EEG telemetry is proving 3x more effective than traditional cockpit sensor systems for fatigue prevention. Proud to partner with aerospace manufacturers on our upcoming commercial pilots.",
        postType: "TEXT",
        visibility: "PUBLIC",
        communityId: spaceHub,
        hashtags: ["DeepTech", "Neuroscience", "Aerospace"],
        likesCount: 76,
        commentsCount: 11,
        sharesCount: 5,
        bookmarksCount: 18,
        createdAt: new Date(Date.now() - 20 * 3600000),
      },
      {
        wqAuthorId: "wq-user-david-kim",
        authorName: "David Kim",
        authorUsername: "davidkim",
        authorHeadline: "Managing Director @ Founders Fund",
        authorRole: "INVESTOR",
        authorVerificationLevel: "GOLD",
        content: "Rule of 40 is no longer optional for Series B issuers in 2026. Capital efficiency, verified GAAP ledger audits, and repeatable secondary order flow are the top three metrics we evaluate before co-investment allocations.",
        postType: "TEXT",
        visibility: "PUBLIC",
        communityId: null,
        hashtags: ["VentureCapital", "SaaS", "Valuation"],
        likesCount: 185,
        commentsCount: 31,
        sharesCount: 22,
        bookmarksCount: 63,
        createdAt: new Date(Date.now() - 28 * 3600000),
      },
      {
        wqAuthorId: "wq-uuid-demo-author",
        name: "Alexander Vance",
        authorName: "Alexander Vance",
        authorUsername: "alexvance",
        authorHeadline: "Managing Partner · Quantex Sovereign Capital",
        authorRole: "INVESTOR",
        authorVerificationLevel: "PLATINUM",
        content: "White Quantex automated secondary escrow contracts have now cleared over $50M in corporate transfers this quarter with 100% statutory SEC CIK compliance. Proud of the institutional allocators and founders collaborating on this platform.",
        postType: "TEXT",
        visibility: "PUBLIC",
        communityId: fintechHub,
        hashtags: ["Fintech", "Escrow", "SecondaryMarkets"],
        likesCount: 310,
        commentsCount: 58,
        sharesCount: 44,
        bookmarksCount: 102,
        createdAt: new Date(Date.now() - 36 * 3600000),
      },
    ])

    console.log(`[Seed] Created ${createdPosts.length} posts.`)

    // Seed sample comments on the first post
    const firstPost = createdPosts[0]
    await Comment.insertMany([
      {
        postId: firstPost._id,
        wqAuthorId: "wq-user-david-kim",
        authorName: "David Kim",
        content: "Fantastic traction on the enterprise pilot! Would love to see the latency benchmark breakdown next week.",
        likesCount: 4,
      },
      {
        postId: firstPost._id,
        wqAuthorId: "wq-user-sarah-chen",
        authorName: "Sarah Chen",
        content: "Congratulations Elena! The compute efficiency metrics you achieved are truly best-in-class.",
        likesCount: 7,
      },
    ])
  }

  // 4. Seed Notifications
  const notifCount = await Notification.countDocuments()
  if (notifCount === 0) {
    await Notification.insertMany([
      {
        wqUserId: "wq-uuid-demo-author",
        type: "LIKE",
        actorName: "Elena Voss",
        actorHeadline: "Founder @ NovaMind AI",
        actorRole: "FOUNDER",
        message: "liked your post 'White Quantex automated secondary escrow contracts...'.",
        isRead: false,
        createdAt: new Date(Date.now() - 120000),
      },
      {
        wqUserId: "wq-uuid-demo-author",
        type: "FOLLOW",
        actorName: "Sarah Chen",
        actorHeadline: "General Partner @ Sequoia",
        actorRole: "INVESTOR",
        message: "started following your investor profile.",
        isRead: false,
        createdAt: new Date(Date.now() - 900000),
      },
      {
        wqUserId: "wq-uuid-demo-author",
        type: "VENTURE",
        actorName: "VerdeGrid Energy",
        actorHeadline: "CleanTech Startup",
        actorRole: "FOUNDER",
        message: "published a new fundraising campaign: $3.5M Series A.",
        isRead: false,
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        wqUserId: "wq-uuid-demo-author",
        type: "VERIFICATION",
        actorName: "White Quantex Trust",
        actorHeadline: "System Security",
        actorRole: "SYSTEM",
        message: "Your profile verification level was upgraded to Platinum Verified.",
        isRead: true,
        createdAt: new Date(Date.now() - 10800000),
      },
      {
        wqUserId: "wq-uuid-demo-author",
        type: "COMMENT",
        actorName: "David Kim",
        actorHeadline: "Managing Director @ Founders Fund",
        actorRole: "INVESTOR",
        message: "commented: 'Fantastic traction on the enterprise pilot!'",
        isRead: true,
        createdAt: new Date(Date.now() - 18000000),
      },
    ])
    console.log("[Seed] Created 5 initial notifications.")
  }

  console.log("[Seed] Community seed completed successfully!")
}

// Auto-run if executed directly via node src/seed.mjs
if (process.argv[1]?.endsWith("seed.mjs")) {
  seedCommunityData().then(() => {
    process.exit(0)
  }).catch((err) => {
    console.error("[Seed Error]", err)
    process.exit(1)
  })
}
