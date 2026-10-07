var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/data/presetCatalogue.ts
var RESEARCH_PRESETS;
var init_presetCatalogue = __esm({
  "src/data/presetCatalogue.ts"() {
    RESEARCH_PRESETS = [
      // ==========================================
      // 1. TECHNOLOGY & SOFTWARE
      // ==========================================
      {
        preset_id: "tech_saas_b2b",
        name: "B2B SaaS Platforms",
        industry: "Technology & Software",
        sub_industry: "Cloud Software",
        description: "B2B cloud software providers advertising subscription business tools.",
        primary_keywords: ["saas", "cloud software", "business software"],
        secondary_keywords: ["crm", "erp", "workflow automation", "enterprise software"],
        optional_exclusions: ["free software", "pirate", "torrent"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["SaaS", "B2B Software", "Cloud Platforms", "Enterprise SaaS"]
      },
      {
        preset_id: "tech_crm_platforms",
        name: "CRM & Pipeline Software",
        industry: "Technology & Software",
        sub_industry: "Sales Technology",
        description: "Customer relationship management and sales automation software vendors.",
        primary_keywords: ["crm software", "sales pipeline software", "lead management software"],
        secondary_keywords: ["pipeline crm", "contact manager", "deal tracking"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["CRM", "Sales CRM", "Pipeline Tool"]
      },
      {
        preset_id: "tech_devops_cloud",
        name: "DevOps & Cloud Infrastructure",
        industry: "Technology & Software",
        sub_industry: "Developer Tools",
        description: "Continuous delivery, Kubernetes, cloud hosting, and infrastructure monitoring.",
        primary_keywords: ["devops platform", "kubernetes management", "cloud infrastructure"],
        secondary_keywords: ["ci/cd pipeline", "container orchestration", "cloud monitoring"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["DevOps", "Cloud Infra", "Kubernetes"]
      },
      {
        preset_id: "tech_cybersecurity_b2b",
        name: "Cybersecurity & Compliance",
        industry: "Technology & Software",
        sub_industry: "Security & Privacy",
        description: "Enterprise endpoint protection, SOC 2 compliance automation, and threat defense.",
        primary_keywords: ["cybersecurity solution", "soc 2 compliance", "endpoint security"],
        secondary_keywords: ["vulnerability management", "data security platform", "zero trust"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Cybersecurity", "SOC 2", "InfoSec", "Penetration Testing"]
      },
      {
        preset_id: "tech_fintech_software",
        name: "FinTech & Billing Software",
        industry: "Technology & Software",
        sub_industry: "Financial Technology",
        description: "Corporate spend management, payroll automation, and recurring billing systems.",
        primary_keywords: ["spend management software", "payroll software", "subscription billing"],
        secondary_keywords: ["corporate card", "invoicing software", "expense automation"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["FinTech", "Payroll SaaS", "Billing Engine"]
      },
      {
        preset_id: "tech_hr_recruitment_saas",
        name: "HR & ATS Talent Software",
        industry: "Technology & Software",
        sub_industry: "Human Resources",
        description: "Applicant tracking systems, employee onboarding, and HR information systems.",
        primary_keywords: ["applicant tracking system", "hr software", "employee onboarding platform"],
        secondary_keywords: ["ats software", "hris", "recruitment software"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["HR Tech", "ATS", "HRIS", "Staffing Software"]
      },
      // ==========================================
      // 2. HEALTHCARE & MEDICAL
      // ==========================================
      {
        preset_id: "health_dental_clinics",
        name: "Dental & Orthodontic Clinics",
        industry: "Healthcare & Medical",
        sub_industry: "Dental Services",
        description: "Private dental practices advertising cosmetic dentistry, implants, and clear aligners.",
        primary_keywords: ["dental implants", "cosmetic dentist", "clear aligners"],
        secondary_keywords: ["emergency dentist", "teeth whitening clinic", "invisalign dentist"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Dentist", "Orthodontist", "Dental Implants"]
      },
      {
        preset_id: "health_med_spa_aesthetic",
        name: "Medical Spas & Aesthetics",
        industry: "Healthcare & Medical",
        sub_industry: "Aesthetic Medicine",
        description: "Clinics offering Botox, dermal fillers, laser skin resurfacing, and body contouring.",
        primary_keywords: ["med spa", "botox clinic", "laser hair removal"],
        secondary_keywords: ["dermal fillers", "body contouring", "skin rejuvenation clinic"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["MedSpa", "Aesthetic Clinic", "Cosmetic Dermatology"]
      },
      {
        preset_id: "health_mental_telehealth",
        name: "Mental Health & Teletherapy",
        industry: "Healthcare & Medical",
        sub_industry: "Mental Health",
        description: "Private therapy practices, online counseling, and licensed mental health clinics.",
        primary_keywords: ["online therapy", "licensed counselor", "adhd assessment clinic"],
        secondary_keywords: ["couples therapy", "telehealth psychiatry", "anxiety counseling"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Therapy", "Telehealth", "Counseling", "Psychiatry"]
      },
      {
        preset_id: "health_veterinary_clinics",
        name: "Veterinary Hospitals & Clinics",
        industry: "Healthcare & Medical",
        sub_industry: "Veterinary Medicine",
        description: "Animal hospitals, urgent pet care, and companion animal veterinary clinics.",
        primary_keywords: ["veterinary hospital", "animal clinic", "emergency vet"],
        secondary_keywords: ["pet wellness exam", "vet surgery clinic", "canine care center"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Vet", "Animal Hospital", "Veterinarian"]
      },
      {
        preset_id: "health_optometry_eyecare",
        name: "Optometry & Eye Care Centers",
        industry: "Healthcare & Medical",
        sub_industry: "Vision Care",
        description: "Independent optometrists, LASIK eye surgery clinics, and designer optical boutiques.",
        primary_keywords: ["lasik eye surgery", "optometrist eye exam", "designer eyewear clinic"],
        secondary_keywords: ["cataract surgery center", "vision correction", "prescription glasses clinic"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Eye Clinic", "LASIK", "Optometrist"]
      },
      // ==========================================
      // 3. HOME SERVICES & TRADES
      // ==========================================
      {
        preset_id: "home_hvac_heating_cooling",
        name: "HVAC Installation & Repair",
        industry: "Home Services & Trades",
        sub_industry: "Climate Control",
        description: "Air conditioning, heat pump replacement, and furnace repair contractors.",
        primary_keywords: ["ac installation", "furnace replacement", "hvac repair contractor"],
        secondary_keywords: ["heat pump installation", "air conditioning service", "emergency hvac"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["HVAC", "Air Conditioning", "Heating", "Heat Pump"]
      },
      {
        preset_id: "home_roofing_contractors",
        name: "Roofing & Siding Contractors",
        industry: "Home Services & Trades",
        sub_industry: "Exterior Remodeling",
        description: "Commercial and residential roof replacement, hail damage repair, and gutter systems.",
        primary_keywords: ["roof replacement contractor", "roof repair company", "metal roofing"],
        secondary_keywords: ["storm damage roof inspection", "residential siding", "seamless gutters"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Roofing", "Roofers", "Siding Contractor"]
      },
      {
        preset_id: "home_solar_energy",
        name: "Solar Panel Installation & Batteries",
        industry: "Home Services & Trades",
        sub_industry: "Renewable Energy",
        description: "Residential solar power systems, battery backup storage, and commercial solar EPC.",
        primary_keywords: ["solar panel installation", "home battery backup", "commercial solar"],
        secondary_keywords: ["residential solar financing", "solar roof quote", "clean energy savings"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Solar", "Renewable Energy", "Solar Financing", "Solar Panels"]
      },
      {
        preset_id: "home_plumbing_water",
        name: "Plumbing & Water Filtration",
        industry: "Home Services & Trades",
        sub_industry: "Plumbing Systems",
        description: "Plumbing repairs, tankless water heater installation, and whole-house filtration.",
        primary_keywords: ["emergency plumber", "water heater replacement", "whole house water filter"],
        secondary_keywords: ["drain cleaning service", "tankless water heater", "sewer line repair"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Plumber", "Plumbing", "Water Heaters"]
      },
      {
        preset_id: "home_pest_control",
        name: "Pest & Termite Control",
        industry: "Home Services & Trades",
        sub_industry: "Pest Management",
        description: "Exterminator services, termite inspections, bed bug treatments, and rodent exclusion.",
        primary_keywords: ["pest control service", "termite inspection company", "bed bug treatment"],
        secondary_keywords: ["commercial exterminator", "rodent control", "mosquito defense program"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Pest Control", "Exterminator", "Termite Control"]
      },
      // ==========================================
      // 4. FINANCIAL SERVICES
      // ==========================================
      {
        preset_id: "fin_commercial_lending",
        name: "Commercial & Business Lending",
        industry: "Financial Services",
        sub_industry: "Commercial Financing",
        description: "Equipment financing, working capital lines of credit, and SBA commercial loans.",
        primary_keywords: ["business loan", "equipment financing", "working capital line of credit"],
        secondary_keywords: ["sba loan broker", "commercial mortgage financing", "invoice factoring"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Business Loans", "Commercial Lending", "Equipment Lease"]
      },
      {
        preset_id: "fin_wealth_management",
        name: "Wealth Advisory & Financial Planning",
        industry: "Financial Services",
        sub_industry: "Wealth Advisory",
        description: "Fiduciary financial advisors, retirement planners, and high-net-worth wealth managers.",
        primary_keywords: ["wealth management firm", "fiduciary financial advisor", "retirement planning"],
        secondary_keywords: ["estate planning advisory", "high net worth wealth planner", "portfolio management"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Wealth Advisor", "Financial Planner", "RIA"]
      },
      {
        preset_id: "fin_tax_accounting_cpa",
        name: "Tax Advisory & CPA Firms",
        industry: "Financial Services",
        sub_industry: "Tax & Accounting",
        description: "Certified public accountants, corporate tax prep, audit, and outsourced bookkeeping.",
        primary_keywords: ["cpa firm", "corporate tax advisory", "outsourced bookkeeping services"],
        secondary_keywords: ["tax resolution specialist", "fractional cfo services", "business tax preparation"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["CPA", "Tax Prep", "Bookkeeping", "Accounting Firm"]
      },
      {
        preset_id: "fin_business_insurance",
        name: "Commercial & Business Insurance",
        industry: "Financial Services",
        sub_industry: "Commercial Insurance",
        description: "General liability, cyber insurance, commercial auto, and workers compensation.",
        primary_keywords: ["commercial insurance broker", "general liability insurance", "workers comp insurance"],
        secondary_keywords: ["cyber liability insurance", "errors and omissions policy", "business owners policy"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Commercial Insurance", "Business Insurance", "BOP"]
      },
      // ==========================================
      // 5. REAL ESTATE & PROPERTY
      // ==========================================
      {
        preset_id: "real_commercial_brokerage",
        name: "Commercial Real Estate Brokerages",
        industry: "Real Estate & Property",
        sub_industry: "Commercial Properties",
        description: "Office, retail, and industrial leasing brokers, triple-net investment advisors.",
        primary_keywords: ["commercial real estate broker", "industrial warehouse lease", "office space leasing"],
        secondary_keywords: ["retail space commercial lease", "nnn investment properties", "commercial property sales"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["CRE", "Commercial Real Estate", "Warehouse Lease"]
      },
      {
        preset_id: "real_property_management",
        name: "Property Management Companies",
        industry: "Real Estate & Property",
        sub_industry: "Asset Management",
        description: "Multifamily residential management, HOA management, and commercial property care.",
        primary_keywords: ["property management company", "hoa management services", "multifamily property manager"],
        secondary_keywords: ["rental property management", "commercial asset management", "tenant placement agency"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Property Manager", "HOA Management", "Rental Management"]
      },
      {
        preset_id: "real_luxury_brokerages",
        name: "Luxury Residential Real Estate",
        industry: "Real Estate & Property",
        sub_industry: "Residential Brokerage",
        description: "High-end home brokerages, luxury estate specialists, and waterfront property realtors.",
        primary_keywords: ["luxury real estate agent", "waterfront homes for sale", "luxury estate brokerage"],
        secondary_keywords: ["custom home realtor", "high end listing agent", "gated community homes"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Luxury Realtor", "Real Estate Agent", "Residential Brokerage"]
      },
      // ==========================================
      // 6. PROFESSIONAL & BUSINESS SERVICES
      // ==========================================
      {
        preset_id: "prof_growth_marketing_agencies",
        name: "B2B Digital Marketing Agencies",
        industry: "Professional Services",
        sub_industry: "Digital Marketing",
        description: "Performance advertising, SEO agencies, conversion rate optimization, and brand studios.",
        primary_keywords: ["b2b marketing agency", "performance marketing firm", "seo agency services"],
        secondary_keywords: ["paid social advertising agency", "lead generation agency", "b2b content studio"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Marketing Agency", "Growth Agency", "SEO Agency", "Lead Gen Agency"]
      },
      {
        preset_id: "prof_it_managed_services",
        name: "Managed IT Services (MSP)",
        industry: "Professional Services",
        sub_industry: "IT Consulting",
        description: "Outsourced IT helpdesk, network administration, cloud migrations, and MSP support.",
        primary_keywords: ["managed it services", "msp it provider", "it support company"],
        secondary_keywords: ["outsourced it helpdesk", "business network security", "cloud migration consultant"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["MSP", "Managed IT", "IT Helpdesk", "IT Support"]
      },
      {
        preset_id: "prof_legal_corporate_law",
        name: "Corporate & Business Law Firms",
        industry: "Professional Services",
        sub_industry: "Legal Services",
        description: "M&A legal counsel, intellectual property attorneys, and corporate formation lawyers.",
        primary_keywords: ["corporate law firm", "business litigation attorney", "intellectual property lawyer"],
        secondary_keywords: ["m&a legal advisory", "trademark attorney", "employment law firm"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Law Firm", "Corporate Attorney", "Business Lawyer"]
      },
      {
        preset_id: "prof_executive_search_staffing",
        name: "Executive Search & Staffing Agencies",
        industry: "Professional Services",
        sub_industry: "Staffing & Recruiting",
        description: "Retained executive search, technical recruitment, and healthcare staffing agencies.",
        primary_keywords: ["executive search firm", "technical staffing agency", "recruiting agency"],
        secondary_keywords: ["retained executive recruiter", "locum tenens healthcare staffing", "it recruitment firm"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Recruiter", "Staffing Agency", "Headhunter", "Executive Search"]
      },
      // ==========================================
      // 7. MANUFACTURING & INDUSTRIAL
      // ==========================================
      {
        preset_id: "mfg_contract_cnc_machining",
        name: "Precision CNC Machining & Fabrication",
        industry: "Manufacturing & Industrial",
        sub_industry: "Metal Fabrication",
        description: "Custom CNC milling, precision sheet metal fabrication, and contract manufacturing.",
        primary_keywords: ["cnc machining services", "precision sheet metal fabrication", "custom contract manufacturing"],
        secondary_keywords: ["5-axis cnc milling", "rapid prototyping parts", "laser cutting services"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["CNC Machining", "Fabrication", "Metal Stamping"]
      },
      {
        preset_id: "mfg_industrial_automation",
        name: "Industrial Automation & Robotics",
        industry: "Manufacturing & Industrial",
        sub_industry: "Factory Automation",
        description: "PLC programming, robotic arm integration, machine vision, and SCADA systems.",
        primary_keywords: ["industrial automation integrator", "robotics system integrator", "plc programming services"],
        secondary_keywords: ["machine vision inspection", "automated conveyor systems", "scada engineering"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Industrial Automation", "Robotics Integrator", "PLC"]
      },
      {
        preset_id: "mfg_packaging_corrugated",
        name: "Custom Packaging & Box Manufacturers",
        industry: "Manufacturing & Industrial",
        sub_industry: "Packaging Solutions",
        description: "Corrugated mailer boxes, folding cartons, luxury rigid boxes, and sustainable packaging.",
        primary_keywords: ["custom corrugated boxes", "folding carton manufacturer", "custom printed packaging"],
        secondary_keywords: ["rigid gift box supplier", "sustainable packaging company", "protective foam inserts"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Packaging", "Custom Boxes", "Corrugated"]
      },
      // ==========================================
      // 8. LOGISTICS & TRANSPORTATION
      // ==========================================
      {
        preset_id: "logistics_3pl_freight",
        name: "Third-Party Logistics (3PL) & Freight",
        industry: "Transportation & Logistics",
        sub_industry: "Freight & Fulfillment",
        description: "E-commerce fulfillment centers, freight forwarding, cold storage, and intermodal transport.",
        primary_keywords: ["3pl fulfillment warehouse", "freight brokerage company", "intermodal transportation"],
        secondary_keywords: ["cold chain storage warehouse", "ecommerce pick and pack", "ltl freight shipping"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["3PL", "Freight Broker", "Warehousing", "Fulfillment"]
      },
      {
        preset_id: "logistics_fleet_telematics",
        name: "Fleet Telematics & GPS Tracking",
        industry: "Transportation & Logistics",
        sub_industry: "Fleet Technology",
        description: "Commercial fleet management software, ELD compliance, and dashcam safety systems.",
        primary_keywords: ["fleet telematics software", "eld compliance system", "fleet dash cam safety"],
        secondary_keywords: ["gps fleet tracking", "driver safety monitoring", "fuel management system"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Fleet Management", "Telematics", "GPS Tracking"]
      },
      // ==========================================
      // 9. EDUCATION & TRAINING
      // ==========================================
      {
        preset_id: "edu_corporate_compliance_training",
        name: "Corporate Training & Leadership Development",
        industry: "Education & Training",
        sub_industry: "Corporate Education",
        description: "Executive coaching programs, enterprise compliance e-learning, and sales bootcamps.",
        primary_keywords: ["executive leadership coaching", "corporate compliance training", "sales training program"],
        secondary_keywords: ["enterprise lms content", "management training workshop", "workplace diversity training"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Corporate Training", "Executive Coaching", "Leadership Training"]
      },
      {
        preset_id: "edu_certifications_bootcamps",
        name: "Professional Certifications & Bootcamps",
        industry: "Education & Training",
        sub_industry: "Professional Skills",
        description: "Coding bootcamps, cybersecurity certification courses, and PMP credential prep.",
        primary_keywords: ["coding bootcamp", "cybersecurity certification training", "pmp exam prep course"],
        secondary_keywords: ["data analytics bootcamp", "cloud engineer certification", "tech career training"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Bootcamp", "Certification Prep", "Coding School"]
      },
      // ==========================================
      // 10. RETAIL & E-COMMERCE
      // ==========================================
      {
        preset_id: "retail_dtc_apparel_fashion",
        name: "Direct-to-Consumer (DTC) Fashion Brands",
        industry: "Retail & E-commerce",
        sub_industry: "Apparel & Accessories",
        description: "Independent apparel brands, sustainable activewear, and designer accessories.",
        primary_keywords: ["sustainable activewear", "custom leather goods", "luxury streetwear brand"],
        secondary_keywords: ["dtc apparel brand", "bamboo clothing", "minimalist watches brand"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["DTC Apparel", "Fashion Brand", "Activewear"]
      },
      {
        preset_id: "retail_subscription_box",
        name: "Subscription Commerce & Box Services",
        industry: "Retail & E-commerce",
        sub_industry: "Subscription Goods",
        description: "Curated monthly subscription boxes for coffee, grooming, pet supplies, and snacks.",
        primary_keywords: ["monthly subscription box", "curated coffee subscription", "pet supply subscription"],
        secondary_keywords: ["grooming subscription box", "artisan snack box", "membership club delivery"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Subscription Box", "SubBox", "Subscription Club"]
      },
      // ==========================================
      // 11. AUTOMOTIVE
      // ==========================================
      {
        preset_id: "auto_fleet_commercial_leasing",
        name: "Commercial Fleet Leasing & Vans",
        industry: "Automotive",
        sub_industry: "Commercial Fleet",
        description: "Work truck upfitting, commercial cargo van leasing, and enterprise fleet acquisition.",
        primary_keywords: ["commercial van leasing", "work truck upfitting", "commercial vehicle fleet sales"],
        secondary_keywords: ["cargo van fleet financing", "box truck lease", "utility truck body builder"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Fleet Leasing", "Commercial Vans", "Work Trucks"]
      },
      {
        preset_id: "auto_collision_repair_centers",
        name: "Auto Collision & Body Repair Centers",
        industry: "Automotive",
        sub_industry: "Vehicle Repair",
        description: "Certified collision repair shops, paintless dent repair, and auto body restoration.",
        primary_keywords: ["collision repair center", "auto body shop repair", "paintless dent removal"],
        secondary_keywords: ["certified collision center", "car paint restoration", "bumper repair service"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Auto Body", "Collision Repair", "Dent Repair"]
      },
      // ==========================================
      // 12. CLEANING & FACILITIES MANAGEMENT
      // ==========================================
      {
        preset_id: "clean_commercial_janitorial",
        name: "Commercial Janitorial & Office Cleaning",
        industry: "Cleaning & Facilities",
        sub_industry: "Janitorial Services",
        description: "Nightly office cleaning, commercial floor waxing, medical facility disinfection.",
        primary_keywords: ["commercial janitorial service", "office cleaning company", "medical facility cleaning"],
        secondary_keywords: ["commercial floor strip and wax", "post construction cleaning", "industrial cleaning contractor"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Janitorial", "Office Cleaning", "Commercial Cleaning"]
      },
      {
        preset_id: "clean_disaster_restoration",
        name: "Water & Fire Disaster Restoration",
        industry: "Cleaning & Facilities",
        sub_industry: "Disaster Restoration",
        description: "Emergency water extraction, smoke and fire cleanup, and certified mold remediation.",
        primary_keywords: ["water damage restoration company", "fire damage cleanup", "mold remediation contractor"],
        secondary_keywords: ["emergency water extraction", "sewage backup cleanup", "structural drying service"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Restoration", "Water Damage", "Mold Remediation"]
      },
      // ==========================================
      // 13. SECURITY SERVICES
      // ==========================================
      {
        preset_id: "sec_commercial_surveillance_alarms",
        name: "Commercial Surveillance & Access Control",
        industry: "Security Services",
        sub_industry: "Physical Security",
        description: "Security camera installation, keycard access control systems, and commercial burglar alarms.",
        primary_keywords: ["commercial security camera installation", "access control systems", "commercial burglar alarm"],
        secondary_keywords: ["cctv surveillance installer", "cloud video surveillance", "keycard door lock installation"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Security Cameras", "Access Control", "Commercial Alarm"]
      },
      // ==========================================
      // 14. FITNESS & WELLNESS
      // ==========================================
      {
        preset_id: "fit_boutique_studios",
        name: "Boutique Fitness & Pilates Studios",
        industry: "Fitness & Wellness",
        sub_industry: "Fitness Centers",
        description: "Reformer Pilates studios, HIIT training clubs, and boutique fitness franchises.",
        primary_keywords: ["reformer pilates studio", "boutique fitness club", "hiit group fitness"],
        secondary_keywords: ["hot yoga studio", "strength training gym membership", "spin cycling studio"],
        default_location_behavior: { defaultLocationCode: "US", allowsGlobal: true },
        website_required: true,
        default_result_limit: 50,
        version: "v2.1.0",
        status: "ACTIVE",
        aliases: ["Pilates", "Gym", "Fitness Studio", "HIIT"]
      }
    ];
  }
});

// src/extension/evidenceWaterfall.ts
var evidenceWaterfall_exports = {};
__export(evidenceWaterfall_exports, {
  RELEVANCE_ENGINE_VERSION_V3: () => RELEVANCE_ENGINE_VERSION_V3,
  RELEVANCE_STRATEGY_VERSION_V3: () => RELEVANCE_STRATEGY_VERSION_V3,
  buildUncertainRecord: () => buildUncertainRecord,
  calculateEvidenceCoverage: () => calculateEvidenceCoverage,
  collectEvidenceWaterfall: () => collectEvidenceWaterfall,
  createEntityEvidenceProfile: () => createEntityEvidenceProfile,
  createEvidenceSignature: () => createEvidenceSignature,
  evaluateStrictRelevanceV3: () => evaluateStrictRelevanceV3,
  integrateWebsiteVerificationEvidence: () => integrateWebsiteVerificationEvidence,
  recordCandidateEvidenceInProfile: () => recordCandidateEvidenceInProfile
});
function createEvidenceSignature(type, source, strength, value) {
  const normVal = (value || "").toLowerCase().trim().replace(/\s+/g, " ");
  return `${type}::${source}::${strength}::${normVal}`;
}
function createEntityEvidenceProfile(entityKey, advertiserName, canonicalName) {
  return {
    entityKey,
    advertiserName,
    canonicalName: canonicalName || advertiserName,
    uniqueEvidenceMap: /* @__PURE__ */ new Map(),
    observedEvidenceOccurrences: 0,
    distinctAdCopyHashes: /* @__PURE__ */ new Set(),
    distinctAdCount: 0,
    matchedQueries: /* @__PURE__ */ new Set(),
    observedDomains: /* @__PURE__ */ new Set(),
    observedPages: /* @__PURE__ */ new Set(),
    observedDestinationUrls: /* @__PURE__ */ new Set(),
    conflicts: [],
    negativeSignals: []
  };
}
function collectEvidenceWaterfall(evidence, intent) {
  const evidenceList = [];
  const conflicts = [];
  const negativeSignals = [];
  const normalized = normalizeEvidence(evidence);
  const allQueryPhrases = [];
  if (evidence.query) allQueryPhrases.push(evidence.query.toLowerCase().trim());
  if (evidence.matchedKeyword) allQueryPhrases.push(evidence.matchedKeyword.toLowerCase().trim());
  if (intent.primaryKeywords) {
    for (const kw of intent.primaryKeywords) {
      const l = kw.toLowerCase().trim();
      if (!allQueryPhrases.includes(l)) allQueryPhrases.push(l);
    }
  }
  const activeTaxonomies = [];
  for (const [key, tax] of Object.entries(BOUNDED_TAXONOMY)) {
    if (allQueryPhrases.some(
      (phrase) => phrase.includes(key) || tax.rootTerms.some((rt) => phrase.includes(rt))
    )) {
      activeTaxonomies.push(tax);
    }
  }
  if (activeTaxonomies.length === 0 && allQueryPhrases.length > 0) {
    const dynamicRoots = [];
    const dynamicStems = [];
    for (const phrase of allQueryPhrases) {
      dynamicRoots.push(phrase);
      for (const tok of tokenizeText(phrase)) {
        dynamicStems.push(tok);
      }
    }
    activeTaxonomies.push({
      category: allQueryPhrases[0],
      rootTerms: Array.from(new Set(dynamicRoots)),
      productServiceTerms: Array.from(new Set(dynamicStems)),
      industryDescriptors: allQueryPhrases,
      conflictingCategories: ["sports", "healthcare", "politics", "gaming", "casino"]
    });
  }
  const coreQueryTokens = /* @__PURE__ */ new Set();
  for (const phrase of allQueryPhrases) {
    for (const t of tokenizeText(phrase)) {
      coreQueryTokens.add(t);
    }
  }
  for (const tax of activeTaxonomies) {
    for (const rt of tax.rootTerms) {
      for (const t of tokenizeText(rt)) {
        coreQueryTokens.add(t);
      }
    }
  }
  const productTerms = /* @__PURE__ */ new Set();
  for (const tax of activeTaxonomies) {
    for (const t of tax.productServiceTerms) {
      productTerms.add(stemToken(t));
    }
  }
  if (intent.exclusions && intent.exclusions.length > 0) {
    for (const excl of intent.exclusions) {
      const exclLower = excl.toLowerCase();
      if (normalized.advertiserText.includes(exclLower) || normalized.adCopyText.includes(exclLower) || normalized.normalizedDomain.includes(exclLower)) {
        const reason = `Matched preset exclusion rule: "${excl}"`;
        negativeSignals.push(reason);
        conflicts.push({
          type: "CONTRADICTION",
          strength: "STRONG",
          source: "advertiser_name",
          reason,
          matchedSignal: excl,
          reasonCode: "REJECT_PRESET_EXCLUSION",
          value: excl,
          explanation: `Candidate matches explicit preset exclusion rule: ${excl}`,
          signature: createEvidenceSignature("CONTRADICTION", "advertiser_name", "STRONG", excl)
        });
        break;
      }
    }
  }
  for (const negCat of NEGATIVE_CATEGORIES) {
    const isQueryRelatedToNegCat = allQueryPhrases.some(
      (q) => negCat.terms.some((t) => q.includes(t)) || q.includes(negCat.category) || negCat.category === "sports" && (q.includes("football") || q.includes("cricket") || q.includes("sports"))
    );
    if (isQueryRelatedToNegCat) continue;
    let entityContradictionTerm;
    for (const term of negCat.terms) {
      if (normalized.advertiserText.includes(term) || normalized.normalizedDomain.includes(term.replace(/\s+/g, ""))) {
        entityContradictionTerm = term;
        break;
      }
    }
    if (entityContradictionTerm) {
      const reason = `Advertiser entity identity belongs to unrelated category (${negCat.category}): "${entityContradictionTerm}"`;
      negativeSignals.push(reason);
      conflicts.push({
        type: "CONTRADICTION",
        strength: "STRONG",
        source: "advertiser_name",
        reason,
        matchedSignal: entityContradictionTerm,
        reasonCode: "REJECT_CONTRADICTION_IDENTITY",
        value: entityContradictionTerm,
        explanation: `Advertiser belongs to conflicting ${negCat.category} vertical`,
        signature: createEvidenceSignature("CONTRADICTION", "advertiser_name", "STRONG", entityContradictionTerm)
      });
      continue;
    }
    for (const term of negCat.terms) {
      if (normalized.adCopyText.includes(term) || normalized.normalizedDomain.includes(term.replace(/\s+/g, ""))) {
        const reason = `Unrelated ${negCat.category} signal detected in candidate ad context: "${term}"`;
        negativeSignals.push(reason);
        conflicts.push({
          type: "NEGATIVE_CATEGORY",
          strength: "STRONG",
          source: "ad_text",
          reason,
          matchedSignal: term,
          reasonCode: "REJECT_CONFLICT",
          value: term,
          explanation: `Context contains conflicting ${negCat.category} terms`,
          signature: createEvidenceSignature("NEGATIVE_CATEGORY", "ad_text", "STRONG", term)
        });
        break;
      }
    }
  }
  let strongNameFound = false;
  for (const phrase of allQueryPhrases) {
    if (normalized.advertiserText.includes(phrase)) {
      strongNameFound = true;
      evidenceList.push({
        type: "ENTITY_IDENTITY",
        strength: "STRONG",
        source: "advertiser_name",
        reason: `Advertiser name explicitly contains target category query "${phrase}"`,
        matchedSignal: phrase,
        reasonCode: "SIGNAL_ENTITY_NAME_EXACT",
        value: phrase,
        explanation: `Business name explicitly specifies target category: ${phrase}`,
        signature: createEvidenceSignature("ENTITY_IDENTITY", "advertiser_name", "STRONG", phrase)
      });
      break;
    }
  }
  if (!strongNameFound) {
    const matchedTokensInName = normalized.normalizedAdvertiserTokens.filter((t) => coreQueryTokens.has(t));
    if (matchedTokensInName.length > 0) {
      strongNameFound = true;
      const val = matchedTokensInName.join(", ");
      evidenceList.push({
        type: "ENTITY_IDENTITY",
        strength: "STRONG",
        source: "advertiser_name",
        reason: `Advertiser name contains core target keyword stem(s): ${val}`,
        matchedSignal: val,
        reasonCode: "SIGNAL_ENTITY_NAME_CORE",
        value: val,
        explanation: `Business name contains core keyword stem(s): ${val}`,
        signature: createEvidenceSignature("ENTITY_IDENTITY", "advertiser_name", "STRONG", val)
      });
    } else {
      const productTokensInName = normalized.normalizedAdvertiserTokens.filter((t) => productTerms.has(t));
      const matchedSubstringProduct = Array.from(productTerms).filter(
        (pt) => pt.length >= 4 && normalized.advertiserText.includes(pt)
      );
      const combined = Array.from(/* @__PURE__ */ new Set([...productTokensInName, ...matchedSubstringProduct]));
      if (combined.length > 0) {
        const val = combined.join(", ");
        evidenceList.push({
          type: "ENTITY_IDENTITY",
          strength: "MODERATE",
          source: "advertiser_name",
          reason: `Advertiser name contains target product term(s): ${val}`,
          matchedSignal: val,
          reasonCode: "SIGNAL_ENTITY_NAME_PRODUCT",
          value: val,
          explanation: `Business name contains relevant product or service terms: ${val}`,
          signature: createEvidenceSignature("ENTITY_IDENTITY", "advertiser_name", "MODERATE", val)
        });
      }
    }
  }
  if (normalized.normalizedDomain) {
    const domainHasQuery = allQueryPhrases.some(
      (p) => normalized.normalizedDomain.includes(p.replace(/\s+/g, ""))
    );
    const domainHasProduct = Array.from(productTerms).some(
      (t) => t.length >= 4 && normalized.normalizedDomain.includes(t)
    );
    if (domainHasQuery) {
      evidenceList.push({
        type: "DESTINATION_MATCH",
        strength: "STRONG",
        source: "destination_domain",
        reason: `Destination domain "${normalized.normalizedDomain}" explicitly contains target query`,
        matchedSignal: normalized.normalizedDomain,
        reasonCode: "SIGNAL_DOMAIN_QUERY_EXACT",
        value: normalized.normalizedDomain,
        explanation: `Destination website domain matches target query`,
        signature: createEvidenceSignature("DESTINATION_MATCH", "destination_domain", "STRONG", normalized.normalizedDomain)
      });
    } else if (domainHasProduct) {
      evidenceList.push({
        type: "DOMAIN_SIGNAL",
        strength: "MODERATE",
        source: "destination_domain",
        reason: `Destination domain "${normalized.normalizedDomain}" contains category product term`,
        matchedSignal: normalized.normalizedDomain,
        reasonCode: "SIGNAL_DOMAIN_PRODUCT",
        value: normalized.normalizedDomain,
        explanation: `Destination website domain includes category product term`,
        signature: createEvidenceSignature("DOMAIN_SIGNAL", "destination_domain", "MODERATE", normalized.normalizedDomain)
      });
    }
  }
  if (evidence.facebookPageUrl) {
    const pageUrlLower = evidence.facebookPageUrl.toLowerCase();
    const pageHasQuery = allQueryPhrases.some((p) => pageUrlLower.includes(p.replace(/\s+/g, "")));
    if (pageHasQuery) {
      evidenceList.push({
        type: "FACEBOOK_PAGE_SIGNAL",
        strength: "MODERATE",
        source: "facebook_page",
        reason: `Facebook Page handle/URL reinforces target category identity`,
        matchedSignal: evidence.facebookPageUrl,
        reasonCode: "SIGNAL_PAGE_HANDLE",
        value: evidence.facebookPageUrl,
        explanation: `Facebook page handle reinforces category identity`,
        signature: createEvidenceSignature("FACEBOOK_PAGE_SIGNAL", "facebook_page", "MODERATE", evidence.facebookPageUrl)
      });
    }
  }
  let adCopyMatchedPhrase = false;
  for (const phrase of allQueryPhrases) {
    if (normalized.adCopyText.includes(phrase)) {
      adCopyMatchedPhrase = true;
      evidenceList.push({
        type: "CATEGORY_MATCH",
        strength: "MODERATE",
        source: "ad_text",
        reason: `Ad copy directly mentions target query "${phrase}"`,
        matchedSignal: phrase,
        reasonCode: "SIGNAL_COPY_PHRASE",
        value: phrase,
        explanation: `Ad copy explicitly mentions target query phrase`,
        signature: createEvidenceSignature("CATEGORY_MATCH", "ad_text", "MODERATE", phrase)
      });
      break;
    }
  }
  const foundProductTermsInCopy = Array.from(productTerms).filter(
    (t) => normalized.normalizedAdTextTokens.includes(t) || t.length >= 4 && normalized.adCopyText.includes(t)
  );
  if (foundProductTermsInCopy.length > 0) {
    const sampleTerms = foundProductTermsInCopy.slice(0, 5);
    const val = sampleTerms.join(", ");
    if (foundProductTermsInCopy.length >= 2) {
      evidenceList.push({
        type: "PRODUCT_OR_SERVICE_SIGNAL",
        strength: "STRONG",
        source: "ad_text",
        reason: `Ad copy contains specific category product catalog: ${val}`,
        matchedSignal: val,
        reasonCode: "SIGNAL_COPY_PRODUCT_CATALOG",
        value: val,
        explanation: `Ad offers multiple distinct category products: ${val}`,
        signature: createEvidenceSignature("PRODUCT_OR_SERVICE_SIGNAL", "ad_text", "STRONG", val)
      });
    } else {
      evidenceList.push({
        type: "PRODUCT_OR_SERVICE_SIGNAL",
        strength: "WEAK",
        source: "ad_text",
        reason: `Ad copy mentions category product term: ${sampleTerms[0]}`,
        matchedSignal: sampleTerms[0],
        reasonCode: "SIGNAL_COPY_SINGLE_PRODUCT",
        value: sampleTerms[0],
        explanation: `Ad mentions category product: ${sampleTerms[0]}`,
        signature: createEvidenceSignature("PRODUCT_OR_SERVICE_SIGNAL", "ad_text", "WEAK", sampleTerms[0])
      });
    }
  } else if (!adCopyMatchedPhrase) {
    const matchedTokensInCopy = normalized.normalizedAdTextTokens.filter((t) => coreQueryTokens.has(t));
    if (matchedTokensInCopy.length > 0) {
      const val = matchedTokensInCopy.join(", ");
      evidenceList.push({
        type: "CATEGORY_MATCH",
        strength: "WEAK",
        source: "ad_text",
        reason: `Ad copy mentions keyword stem(s): ${val}`,
        matchedSignal: val,
        reasonCode: "SIGNAL_COPY_STEM_ONLY",
        value: val,
        explanation: `Ad copy only contains isolated keyword stem`,
        signature: createEvidenceSignature("CATEGORY_MATCH", "ad_text", "WEAK", val)
      });
    }
  }
  if (normalized.normalizedUrlSlug) {
    const slugHasProduct = Array.from(productTerms).some(
      (t) => t.length >= 4 && normalized.normalizedUrlSlug.includes(t)
    );
    const slugHasQuery = Array.from(coreQueryTokens).some(
      (t) => normalized.normalizedUrlSlug.includes(t)
    );
    if (slugHasProduct || slugHasQuery) {
      evidenceList.push({
        type: "DESTINATION_MATCH",
        strength: "MODERATE",
        source: "destination_url",
        reason: `Destination URL path contains target product category context`,
        matchedSignal: normalized.normalizedUrlSlug.substring(0, 50),
        reasonCode: "SIGNAL_URL_SLUG_MATCH",
        value: normalized.normalizedUrlSlug.substring(0, 50),
        explanation: `Destination URL path contains target category terms`,
        signature: createEvidenceSignature("DESTINATION_MATCH", "destination_url", "MODERATE", normalized.normalizedUrlSlug.substring(0, 30))
      });
    }
  }
  const ctaLower = (evidence.ctaText || "").toLowerCase().trim();
  if (COMMERCIAL_CTA_PHRASES.has(ctaLower)) {
    evidenceList.push({
      type: "COMMERCIAL_INTENT",
      strength: "MODERATE",
      source: "cta_text",
      reason: `Commercial action call-to-action ("${evidence.ctaText}")`,
      matchedSignal: evidence.ctaText,
      reasonCode: "SIGNAL_COMMERCIAL_INTENT_CTA",
      value: evidence.ctaText,
      explanation: `Commercial call-to-action detected: ${evidence.ctaText}`,
      signature: createEvidenceSignature("COMMERCIAL_INTENT", "cta_text", "MODERATE", ctaLower)
    });
  }
  if (COMMERCIAL_COPY_REGEX.test(normalized.adCopyText)) {
    evidenceList.push({
      type: "COMMERCIAL_INTENT",
      strength: "MODERATE",
      source: "ad_text",
      reason: `Commercial pricing, transaction, or sale language observed in ad copy`,
      reasonCode: "SIGNAL_COMMERCIAL_INTENT_PRICE",
      value: "pricing_or_offer_terms",
      explanation: `Commercial pricing, discount, or offer terms found in ad copy`,
      signature: createEvidenceSignature("COMMERCIAL_INTENT", "ad_text", "MODERATE", "pricing_or_offer_terms")
    });
  }
  if (evidence.matchedKeyword || evidence.query) {
    const q = (evidence.matchedKeyword || evidence.query || "").trim();
    evidenceList.push({
      type: "QUERY_CONTEXT",
      strength: "WEAK",
      source: "matched_query",
      reason: `Discovered under query "${q}"`,
      matchedSignal: q,
      reasonCode: "SIGNAL_QUERY_PROVENANCE",
      value: q,
      explanation: `Candidate surfaced by query: ${q}`,
      signature: createEvidenceSignature("QUERY_CONTEXT", "matched_query", "WEAK", q.toLowerCase())
    });
  }
  return { evidenceList, conflicts, negativeSignals };
}
function calculateEvidenceCoverage(evidenceItems) {
  const APPLICABLE_CATEGORIES = [
    "ENTITY_IDENTITY",
    "CATEGORY_MATCH",
    "COMMERCIAL_INTENT",
    "PRODUCT_OR_SERVICE_SIGNAL",
    "DESTINATION_MATCH",
    "FACEBOOK_PAGE_SIGNAL",
    "DOMAIN_SIGNAL"
  ];
  const presentCategories = Array.from(
    new Set(evidenceItems.map((e) => e.type).filter((t) => APPLICABLE_CATEGORIES.includes(t)))
  );
  const missingCategories = APPLICABLE_CATEGORIES.filter((c) => !presentCategories.includes(c));
  const applicableCategoriesPresent = presentCategories.length;
  const applicableCategoriesTotal = APPLICABLE_CATEGORIES.length;
  const coverageRatio = Math.round(applicableCategoriesPresent / applicableCategoriesTotal * 100) / 100;
  let coverageLevel = "LOW";
  if (applicableCategoriesPresent >= 4) {
    coverageLevel = "HIGH";
  } else if (applicableCategoriesPresent >= 2) {
    coverageLevel = "MEDIUM";
  }
  return {
    applicableCategoriesPresent,
    applicableCategoriesTotal,
    coverageRatio,
    coverageLevel,
    presentCategories,
    missingCategories
  };
}
function recordCandidateEvidenceInProfile(profile, evidence, intent) {
  const { evidenceList, conflicts, negativeSignals } = collectEvidenceWaterfall(evidence, intent);
  for (const c of conflicts) {
    if (!profile.conflicts.some((ex) => ex.signature === c.signature)) {
      profile.conflicts.push(c);
    }
  }
  for (const sig of negativeSignals) {
    if (!profile.negativeSignals.includes(sig)) {
      profile.negativeSignals.push(sig);
    }
  }
  const copyNormalized = (evidence.adText || "").toLowerCase().trim().replace(/\s+/g, " ").substring(0, 120);
  if (copyNormalized) {
    profile.distinctAdCopyHashes.add(copyNormalized);
  }
  profile.distinctAdCount++;
  if (evidence.matchedKeyword) profile.matchedQueries.add(evidence.matchedKeyword);
  if (evidence.query) profile.matchedQueries.add(evidence.query);
  if (evidence.destinationDomain) profile.observedDomains.add(evidence.destinationDomain);
  if (evidence.destinationUrl) profile.observedDestinationUrls.add(evidence.destinationUrl);
  if (evidence.facebookPageUrl) profile.observedPages.add(evidence.facebookPageUrl);
  for (const item of evidenceList) {
    profile.observedEvidenceOccurrences++;
    const sig = item.signature || createEvidenceSignature(item.type, item.source, item.strength, item.value || item.reason);
    const existing = profile.uniqueEvidenceMap.get(sig);
    if (existing) {
      existing.occurrenceCount = (existing.occurrenceCount || 1) + 1;
    } else {
      profile.uniqueEvidenceMap.set(sig, {
        ...item,
        signature: sig,
        occurrenceCount: 1
      });
    }
  }
}
function evaluateStrictRelevanceV3(candidateOrProfile, intent) {
  let profile;
  if ("uniqueEvidenceMap" in candidateOrProfile) {
    profile = candidateOrProfile;
  } else {
    profile = createEntityEvidenceProfile("cand", candidateOrProfile.advertiserName);
    recordCandidateEvidenceInProfile(profile, candidateOrProfile, intent);
  }
  const candEvidence = {
    advertiserName: profile.advertiserName,
    adText: Array.from(profile.distinctAdCopyHashes).join(" "),
    destinationDomain: Array.from(profile.observedDomains)[0],
    destinationUrl: Array.from(profile.observedDestinationUrls)[0],
    facebookPageUrl: Array.from(profile.observedPages)[0],
    matchedKeyword: Array.from(profile.matchedQueries)[0]
  };
  const v2Eval = LeadRelevanceEngine.evaluateCandidate(candEvidence, intent);
  const evidenceItems = Array.from(profile.uniqueEvidenceMap.values());
  const coverage = calculateEvidenceCoverage(evidenceItems);
  const hasHardContradiction = profile.conflicts.some(
    (c) => (c.type === "CONTRADICTION" || c.type === "NEGATIVE_CATEGORY") && c.strength === "STRONG"
  ) || v2Eval.conflicts.some((c) => c.type === "CONTRADICTION" && c.strength === "STRONG");
  const strongEntity = evidenceItems.some(
    (e) => e.type === "ENTITY_IDENTITY" && e.strength === "STRONG"
  );
  const moderateEntity = evidenceItems.some(
    (e) => e.type === "ENTITY_IDENTITY" && e.strength === "MODERATE"
  );
  const strongCategory = evidenceItems.some(
    (e) => (e.type === "CATEGORY_MATCH" || e.type === "PRODUCT_OR_SERVICE_SIGNAL") && e.strength === "STRONG"
  );
  const moderateCategory = evidenceItems.some(
    (e) => (e.type === "CATEGORY_MATCH" || e.type === "PRODUCT_OR_SERVICE_SIGNAL") && e.strength === "MODERATE"
  );
  const weakCategory = evidenceItems.some(
    (e) => e.type === "CATEGORY_MATCH" && e.strength === "WEAK"
  );
  const commercialIntent = evidenceItems.some(
    (e) => e.type === "COMMERCIAL_INTENT"
  );
  const strongDestination = evidenceItems.some(
    (e) => e.type === "DESTINATION_MATCH" && e.strength === "STRONG"
  );
  const moderateDestination = evidenceItems.some(
    (e) => (e.type === "DESTINATION_MATCH" || e.type === "DOMAIN_SIGNAL") && e.strength === "MODERATE"
  );
  let decision = "UNCERTAIN";
  let confidence = "LOW";
  let reasonCode = "UNCERTAIN_AMBIGUOUS_ENTITY";
  let explanation = "";
  const reasons = [];
  if (hasHardContradiction) {
    decision = "NOT_RELEVANT";
    confidence = "HIGH";
    reasonCode = profile.conflicts[0]?.reasonCode || v2Eval.reasonCode || "REJECT_CONTRADICTION_IDENTITY";
    const conflictDesc = profile.negativeSignals[0] || v2Eval.negativeSignals[0] || "Entity conflicts with requested category";
    reasons.push(`Disqualified by Hard Contradiction Gate: ${conflictDesc}`);
    explanation = `Advertiser entity conflicts with target category: ${conflictDesc}`;
    return {
      decision,
      confidence,
      score: 0.05,
      reasons,
      matchedKeywords: v2Eval.matchedKeywords,
      matchedTerms: v2Eval.matchedTerms,
      negativeSignals: profile.negativeSignals.length > 0 ? profile.negativeSignals : v2Eval.negativeSignals,
      evidence: evidenceItems,
      conflicts: profile.conflicts.length > 0 ? profile.conflicts : v2Eval.conflicts,
      evidenceCoverage: coverage,
      uniqueEvidenceSignals: evidenceItems.length,
      observedEvidenceOccurrences: profile.observedEvidenceOccurrences,
      explanation,
      reasonCode,
      strategyVersion: RELEVANCE_STRATEGY_VERSION_V3,
      engineVersion: RELEVANCE_ENGINE_VERSION_V3,
      presetVersion: intent.presetVersion
    };
  }
  if (strongEntity && (moderateCategory || strongCategory || commercialIntent || strongDestination || moderateDestination)) {
    decision = "RELEVANT";
    confidence = strongCategory || commercialIntent || coverage.coverageLevel === "HIGH" ? "HIGH" : "MEDIUM";
    reasonCode = "ACCEPT_STRONG_ENTITY_MATCH";
    reasons.push("Advertiser is confirmed as target business entity with supporting product/commercial evidence.");
    explanation = `Advertiser is identified as a ${intent.primaryKeywords?.[0] || "target"} business with supporting category evidence.`;
  } else if (strongCategory && (commercialIntent || strongDestination || moderateDestination || moderateEntity)) {
    decision = "RELEVANT";
    confidence = commercialIntent && (strongDestination || moderateDestination) ? "HIGH" : "MEDIUM";
    reasonCode = "ACCEPT_MULTI_SIGNAL_MATCH";
    reasons.push("Verified product/service catalog with corroborating commercial intent.");
    explanation = `Explicit product catalog and commercial intent confirm active business in target vertical.`;
  } else if (moderateEntity && (moderateCategory || strongDestination || commercialIntent && weakCategory)) {
    decision = "RELEVANT";
    confidence = "MEDIUM";
    reasonCode = "ACCEPT_MULTI_SIGNAL_MATCH";
    reasons.push("Entity product terms corroborated by destination or commercial evidence.");
    explanation = `Entity product branding corroborated by category match.`;
  } else if (!strongEntity && !moderateEntity && !strongDestination && !moderateDestination && !strongCategory) {
    if (weakCategory || moderateCategory) {
      if (v2Eval.score < 0.18) {
        decision = "NOT_RELEVANT";
        confidence = "HIGH";
        reasonCode = "REJECT_INSUFFICIENT_EVIDENCE";
        reasons.push("Keyword appears in passing but entity has zero commercial or vertical corroboration.");
        explanation = `Keyword appears in ad context, but advertiser lacks verified vertical identity.`;
      } else {
        decision = "UNCERTAIN";
        confidence = "LOW";
        reasonCode = "UNCERTAIN_KEYWORD_ONLY";
        reasons.push("Candidate mentions keyword but lacks independent business or product catalog evidence.");
        explanation = `Keyword mention detected, but advertiser business vertical is unverified.`;
      }
    } else {
      decision = "NOT_RELEVANT";
      confidence = "HIGH";
      reasonCode = "REJECT_CATEGORY_MISMATCH";
      reasons.push("Zero target category or commercial signals found.");
      explanation = `No entity identity, category, or commercial evidence observed for requested vertical.`;
    }
  } else {
    decision = "UNCERTAIN";
    confidence = "LOW";
    reasonCode = "UNCERTAIN_AMBIGUOUS_ENTITY";
    reasons.push("Candidate has partial signals but missing critical category or entity verification.");
    explanation = `Commercial advertiser detected, but vertical identity evidence is incomplete.`;
  }
  if (v2Eval.decision === "NOT_RELEVANT" && decision === "RELEVANT") {
    decision = "NOT_RELEVANT";
    confidence = v2Eval.confidence;
    reasonCode = v2Eval.reasonCode;
    reasons.unshift(`Strict-v2 safety lock: ${v2Eval.reasons[0] || "Score insufficient"}`);
  }
  const finalScore = Math.max(v2Eval.score, decision === "RELEVANT" ? 0.65 : decision === "UNCERTAIN" ? 0.35 : 0.1);
  return {
    decision,
    confidence,
    score: Math.round(finalScore * 100) / 100,
    reasons: [...reasons, ...v2Eval.reasons],
    matchedKeywords: v2Eval.matchedKeywords,
    matchedTerms: v2Eval.matchedTerms,
    negativeSignals: v2Eval.negativeSignals,
    evidence: evidenceItems,
    conflicts: profile.conflicts,
    evidenceCoverage: coverage,
    uniqueEvidenceSignals: evidenceItems.length,
    observedEvidenceOccurrences: profile.observedEvidenceOccurrences,
    explanation,
    reasonCode,
    strategyVersion: RELEVANCE_STRATEGY_VERSION_V3,
    engineVersion: RELEVANCE_ENGINE_VERSION_V3,
    presetVersion: intent.presetVersion
  };
}
function buildUncertainRecord(entityKey, profile, v3Decision) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    entityId: `uncertain_${entityKey}`,
    entityKey,
    canonicalName: profile.canonicalName,
    observedNames: [profile.advertiserName, profile.canonicalName],
    advertiserName: profile.advertiserName,
    matchedQueries: Array.from(profile.matchedQueries),
    identityConfidence: "WEAK",
    evidenceItems: v3Decision.evidence,
    evidence: v3Decision.evidence,
    missingEvidence: v3Decision.evidenceCoverage.missingCategories.map((c) => `MISSING_${c}`),
    reasonCodes: [v3Decision.reasonCode],
    primaryReasonCode: v3Decision.reasonCode,
    reasonCode: v3Decision.reasonCode,
    uncertainReasonCodes: [v3Decision.reasonCode],
    reasons: v3Decision.reasons,
    observedAdIds: Array.from(profile.distinctAdCopyHashes),
    observedDomains: Array.from(profile.observedDomains),
    timestamps: {
      firstDiscovered: now,
      lastEvaluated: now
    },
    queryProvenance: Array.from(profile.matchedQueries),
    evidenceCoverage: v3Decision.evidenceCoverage,
    recordedAt: now,
    decision: "UNCERTAIN",
    confidence: v3Decision.confidence,
    lastEvaluationState: {
      score: v3Decision.score,
      decision: "UNCERTAIN",
      confidence: v3Decision.confidence,
      explanation: v3Decision.explanation
    }
  };
}
function integrateWebsiteVerificationEvidence(profile, websiteRecord) {
  for (const ev of websiteRecord.evidence) {
    if (ev.strength === "CONTRADICTORY") {
      profile.conflicts.push(ev);
      profile.negativeSignals.push(ev.reason);
    } else {
      const sig = ev.signature || createEvidenceSignature(ev.type, ev.source, ev.strength, ev.value || ev.reason);
      if (!profile.uniqueEvidenceMap.has(sig)) {
        profile.uniqueEvidenceMap.set(sig, { ...ev, signature: sig });
        profile.observedEvidenceOccurrences++;
      }
    }
  }
  if (websiteRecord.hostname) {
    profile.observedDomains.add(websiteRecord.hostname);
  }
}
var RELEVANCE_ENGINE_VERSION_V3, RELEVANCE_STRATEGY_VERSION_V3, COMMERCIAL_CTA_PHRASES, COMMERCIAL_COPY_REGEX;
var init_evidenceWaterfall = __esm({
  "src/extension/evidenceWaterfall.ts"() {
    init_relevanceEngine();
    RELEVANCE_ENGINE_VERSION_V3 = "strict-v3";
    RELEVANCE_STRATEGY_VERSION_V3 = 3;
    COMMERCIAL_CTA_PHRASES = /* @__PURE__ */ new Set([
      "shop now",
      "buy now",
      "order now",
      "get quote",
      "contact us",
      "order",
      "book now",
      "sign up",
      "apply now",
      "request quote",
      "call now",
      "schedule now",
      "get offer",
      "claim offer"
    ]);
    COMMERCIAL_COPY_REGEX = /(price|discount|sale|off|taka|bdt|usd|\$|€|£|warranty|deal|buy|shop|order|quote|booking|free consultation|special offer|flat \d+%|starts at|affordable)/i;
  }
});

// src/extension/relevanceEngine.ts
function stemToken(token) {
  const t = token.toLowerCase().trim();
  if (t.length <= 3) return t;
  if (t.endsWith("ies") && t.length > 4) {
    return t.substring(0, t.length - 3) + "y";
  }
  if (t.endsWith("ses") || t.endsWith("xes") || t.endsWith("zes") || t.endsWith("ches") || t.endsWith("shes")) {
    return t.substring(0, t.length - 2);
  }
  if (t.endsWith("s") && !t.endsWith("ss") && !t.endsWith("us") && !t.endsWith("is")) {
    return t.substring(0, t.length - 1);
  }
  return t;
}
function tokenizeText(text) {
  if (!text) return [];
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").split(/[\s-]+/).map((w) => w.trim()).filter((w) => w.length >= 2 && !STOP_WORDS.has(w)).map(stemToken);
}
function extractUrlTokens(urlStr) {
  if (!urlStr) return [];
  try {
    const url = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
    const pathAndQuery = `${url.pathname} ${url.search}`.replace(/[/?&=_.-]/g, " ");
    return tokenizeText(pathAndQuery);
  } catch {
    return tokenizeText(urlStr.replace(/[/?&=_.-]/g, " "));
  }
}
function normalizeEvidence(evidence) {
  const rawAdvertiser = (evidence.advertiserName || "").trim();
  const rawAdCopy = (evidence.adText || "").trim();
  const rawPageName = (evidence.facebookPageName || "").trim();
  const rawCta = (evidence.ctaText || "").trim();
  let rawDomain = (evidence.destinationDomain || "").toLowerCase().trim();
  if (!rawDomain && evidence.destinationUrl) {
    try {
      const u = new URL(evidence.destinationUrl.startsWith("http") ? evidence.destinationUrl : `https://${evidence.destinationUrl}`);
      rawDomain = u.hostname.replace(/^(www\.|m\.|l\.)/, "");
    } catch {
      rawDomain = "";
    }
  }
  return {
    normalizedAdvertiserTokens: tokenizeText(rawAdvertiser),
    normalizedAdTextTokens: tokenizeText(rawAdCopy),
    normalizedDomain: rawDomain,
    normalizedUrlSlug: evidence.destinationUrl ? extractUrlTokens(evidence.destinationUrl).join(" ") : "",
    normalizedPageNameTokens: tokenizeText(rawPageName),
    normalizedCta: rawCta.toLowerCase(),
    advertiserText: rawAdvertiser.toLowerCase(),
    adCopyText: rawAdCopy.toLowerCase()
  };
}
function compileResearchIntent(mode, keywords, presetId, locationCode = "US") {
  const cleanKeywords = keywords.map((k) => k.trim()).filter(Boolean);
  if (mode === "PRESET" && presetId) {
    const preset = RESEARCH_PRESETS.find((p) => p.preset_id === presetId);
    if (preset) {
      return {
        mode: "PRESET",
        keywords: preset.primary_keywords,
        presetId: preset.preset_id,
        presetName: preset.name,
        presetVersion: preset.version,
        targetIndustry: preset.industry,
        targetSubIndustry: preset.sub_industry,
        primaryKeywords: preset.primary_keywords,
        secondaryKeywords: preset.secondary_keywords,
        exclusions: preset.optional_exclusions || [],
        locationCode
      };
    }
  }
  return {
    mode: "CUSTOM",
    keywords: cleanKeywords,
    primaryKeywords: cleanKeywords,
    secondaryKeywords: [],
    exclusions: [],
    locationCode
  };
}
var RELEVANCE_STRATEGY_VERSION, RELEVANCE_ENGINE_VERSION, BOUNDED_TAXONOMY, NEGATIVE_CATEGORIES, STOP_WORDS, LeadRelevanceEngine;
var init_relevanceEngine = __esm({
  "src/extension/relevanceEngine.ts"() {
    init_presetCatalogue();
    RELEVANCE_STRATEGY_VERSION = 2;
    RELEVANCE_ENGINE_VERSION = "strict-v2";
    BOUNDED_TAXONOMY = {
      furniture: {
        category: "furniture",
        rootTerms: ["furniture", "furnishing", "furnishings", "furnish"],
        productServiceTerms: [
          "chair",
          "table",
          "desk",
          "sofa",
          "couch",
          "bed",
          "mattress",
          "cabinet",
          "wardrobe",
          "dining",
          "bench",
          "drawer",
          "drawers",
          "stool",
          "bookshelf",
          "shelf",
          "shelves",
          "almirah",
          "cupboard",
          "recliner",
          "credenza",
          "workstation",
          "seating",
          "lounge",
          "headboard",
          "nightstand",
          "dresser",
          "vanity",
          "sideboard",
          "armchair",
          "futon",
          "loveseat",
          "ottoman",
          "sectional",
          "ergonomic chair",
          "standing desk",
          "bedroom set"
        ],
        industryDescriptors: [
          "furniture store",
          "furniture retailer",
          "furniture manufacturer",
          "furniture studio",
          "home furniture",
          "office furniture",
          "wood furniture",
          "custom furniture",
          "living room",
          "bedroom set",
          "dining room"
        ],
        conflictingCategories: ["sports", "healthcare", "politics", "gaming", "casino", "education", "news_media"]
      },
      restaurant: {
        category: "restaurant",
        rootTerms: ["restaurant", "dining", "eatery", "bistro", "cafe", "food", "grill", "bar & grill", "smokehouse"],
        productServiceTerms: [
          "menu",
          "cuisine",
          "chef",
          "catering",
          "takeaway",
          "takeout",
          "delivery",
          "breakfast",
          "lunch",
          "dinner",
          "brunch",
          "burger",
          "pizza",
          "pasta",
          "steak",
          "seafood",
          "dessert",
          "cocktails",
          "wine",
          "appetizers",
          "buffet",
          "bar",
          "grill",
          "bbq",
          "ribs",
          "brisket",
          "beers",
          "reservation",
          "reservations"
        ],
        industryDescriptors: [
          "fine dining",
          "casual dining",
          "restaurant & bar",
          "cafe & bakery",
          "culinary"
        ],
        conflictingCategories: ["sports", "politics", "gaming", "casino"]
      },
      dental: {
        category: "dental",
        rootTerms: ["dentist", "dental", "orthodontist", "orthodontics"],
        productServiceTerms: [
          "teeth",
          "tooth",
          "invisalign",
          "braces",
          "whitening",
          "implants",
          "cleaning",
          "denture",
          "crown",
          "veneer",
          "extraction",
          "cavity",
          "oral surgery"
        ],
        industryDescriptors: ["dental clinic", "dental practice", "family dentistry"],
        conflictingCategories: ["sports", "politics", "gaming", "furniture"]
      },
      roofing: {
        category: "roofing",
        rootTerms: ["roof", "roofing", "roofer"],
        productServiceTerms: [
          "shingles",
          "gutters",
          "siding",
          "leak repair",
          "metal roof",
          "tile roof",
          "flat roof",
          "roof inspection",
          "roof replacement",
          "flashing",
          "soffit"
        ],
        industryDescriptors: ["roofing contractor", "roofing company", "roofing specialists"],
        conflictingCategories: ["sports", "politics", "gaming"]
      },
      real_estate: {
        category: "real_estate",
        rootTerms: ["real estate", "realty", "realtor", "property", "properties"],
        productServiceTerms: [
          "apartment",
          "condo",
          "townhouse",
          "villa",
          "homes for sale",
          "open house",
          "mortgage",
          "brokerage",
          "leasing",
          "tenant",
          "landlord",
          "commercial space"
        ],
        industryDescriptors: ["real estate agency", "property group", "real estate broker"],
        conflictingCategories: ["sports", "politics", "gaming"]
      },
      marketing_agency: {
        category: "marketing_agency",
        rootTerms: ["marketing agency", "digital marketing", "advertising agency", "media agency"],
        productServiceTerms: [
          "seo",
          "ppc",
          "lead generation",
          "social media marketing",
          "branding",
          "content marketing",
          "web design",
          "growth marketing",
          "performance marketing"
        ],
        industryDescriptors: ["creative agency", "marketing partner", "growth agency"],
        conflictingCategories: ["sports", "politics", "gaming"]
      },
      clothing: {
        category: "clothing",
        rootTerms: ["clothing", "apparel", "fashion", "wear", "garments"],
        productServiceTerms: [
          "dress",
          "shirt",
          "pants",
          "t-shirt",
          "jacket",
          "hoodie",
          "shoes",
          "footwear",
          "denim",
          "jeans",
          "boutique",
          "suits",
          "outfit",
          "swimwear"
        ],
        industryDescriptors: ["clothing brand", "fashion boutique", "apparel store"],
        conflictingCategories: ["sports_team", "politics", "gaming"]
      },
      fitness: {
        category: "fitness",
        rootTerms: ["fitness", "gym", "workout", "training"],
        productServiceTerms: [
          "personal trainer",
          "crossfit",
          "bodybuilding",
          "weightlifting",
          "cardio",
          "yoga",
          "pilates",
          "membership",
          "strength training",
          "coaching"
        ],
        industryDescriptors: ["fitness center", "health club", "gym & fitness"],
        conflictingCategories: ["politics", "gaming", "casino"]
      },
      saas: {
        category: "saas",
        rootTerms: ["saas", "cloud software", "business software", "software platform"],
        productServiceTerms: [
          "crm",
          "erp",
          "pipeline",
          "workflow automation",
          "subscription",
          "enterprise software",
          "dashboard",
          "analytics tool",
          "b2b platform"
        ],
        industryDescriptors: ["b2b saas", "software provider", "cloud solution"],
        conflictingCategories: ["sports", "politics", "casino"]
      },
      construction: {
        category: "construction",
        rootTerms: ["construction", "contractor", "builder", "remodeling"],
        productServiceTerms: [
          "renovation",
          "drywall",
          "masonry",
          "excavation",
          "framing",
          "general contractor",
          "commercial building",
          "home addition",
          "deck building",
          "demolition"
        ],
        industryDescriptors: ["construction company", "building contractors"],
        conflictingCategories: ["sports", "politics", "gaming"]
      },
      photography: {
        category: "photography",
        rootTerms: ["photography", "photographer", "photoshoot"],
        productServiceTerms: [
          "portrait",
          "wedding photography",
          "headshots",
          "studio portrait",
          "videography",
          "photo session",
          "commercial photography",
          "event photography"
        ],
        industryDescriptors: ["photo studio", "photography services"],
        conflictingCategories: ["sports_team", "politics", "gaming"]
      },
      hvac: {
        category: "hvac",
        rootTerms: ["hvac", "air conditioning", "heating", "cooling", "ventilation"],
        productServiceTerms: [
          "furnace",
          "heat pump",
          "duct",
          "ductwork",
          "ac repair",
          "thermostat",
          "compressor",
          "refrigerant",
          "boiler",
          "air filter"
        ],
        industryDescriptors: ["hvac contractor", "heating repair", "ac installation"],
        conflictingCategories: ["sports", "politics", "gaming"]
      },
      home_services: {
        category: "home_services",
        rootTerms: ["home services", "plumbing", "electrician", "handyman", "pest control", "appliance repair"],
        productServiceTerms: [
          "pipe leak",
          "drain cleaning",
          "water heater",
          "wiring",
          "electrical panel",
          "lighting installation",
          "termite control",
          "drywall repair",
          "carpentry",
          "home maintenance"
        ],
        industryDescriptors: ["home service contractor", "emergency plumbing", "residential electrician"],
        conflictingCategories: ["sports", "politics", "gaming"]
      },
      ecommerce: {
        category: "ecommerce",
        rootTerms: ["ecommerce", "online store", "online shop", "retail store", "direct to consumer", "d2c"],
        productServiceTerms: [
          "add to cart",
          "checkout",
          "free shipping",
          "order tracking",
          "fast delivery",
          "storefront",
          "catalog",
          "shopping cart",
          "apparel",
          "accessories",
          "retail"
        ],
        industryDescriptors: ["online store", "ecommerce brand", "direct-to-consumer store"],
        conflictingCategories: ["politics", "casino"]
      },
      professional_services: {
        category: "professional_services",
        rootTerms: ["professional services", "accounting", "legal", "law firm", "consulting", "tax advisory"],
        productServiceTerms: [
          "cpa",
          "tax filing",
          "audit",
          "bookkeeping",
          "litigation",
          "attorney",
          "lawyer",
          "business advisory",
          "corporate legal",
          "compliance advisory"
        ],
        industryDescriptors: ["certified public accountant", "law practice", "management consulting"],
        conflictingCategories: ["sports", "casino", "gaming"]
      }
    };
    NEGATIVE_CATEGORIES = [
      {
        category: "sports",
        terms: [
          "manchester united",
          "premier league",
          "football club",
          "soccer team",
          "cricket board",
          "champions league",
          "matchday",
          "fifa",
          "uefa",
          "nba",
          "nfl",
          "sports club",
          "women team",
          "head coach",
          "stadium"
        ],
        entityTokens: ["fc", "united", "stadium", "club", "league", "team", "cricket", "football", "fifa", "uefa"],
        penalty: -0.65
      },
      {
        category: "healthcare",
        terms: [
          "health support community",
          "saved my husband",
          "seventy-nine",
          "cancer treatment",
          "diabetes remedy",
          "chronic illness",
          "prescription drug",
          "patient clinical",
          "health injustice",
          "clinical trial",
          "disease cure",
          "medical hospital",
          "dental care clinic"
        ],
        entityTokens: ["hospital", "clinic", "medical", "pharma", "health", "doctor", "patient"],
        penalty: -0.65
      },
      {
        category: "politics",
        terms: [
          "political campaign",
          "election rally",
          "vote for",
          "parliament member",
          "political party",
          "candidate for senate",
          "citizens for governance",
          "ballot initiative",
          "party congress"
        ],
        entityTokens: ["party", "senate", "parliament", "campaign", "governance", "election", "voters"],
        penalty: -0.65
      },
      {
        category: "gaming_casino",
        terms: [
          "online casino",
          "slot machine",
          "jackpot betting",
          "poker chips",
          "crypto casino",
          "betting odds",
          "spin to win",
          "roulette online"
        ],
        entityTokens: ["casino", "betting", "poker", "slots", "jackpot"],
        penalty: -0.65
      },
      {
        category: "news_media",
        terms: [
          "breaking news",
          "daily news",
          "news network",
          "news channel",
          "broadcasting station",
          "journalism report",
          "magazine online"
        ],
        entityTokens: ["news", "media", "journal", "broadcasting", "times", "chronicle", "gazette"],
        penalty: -0.55
      },
      {
        category: "education",
        terms: [
          "university admissions",
          "undergraduate degree",
          "campus tuition",
          "public school district",
          "college alumni",
          "academic curriculum"
        ],
        entityTokens: ["university", "college", "school", "academy", "campus", "alumni"],
        penalty: -0.55
      },
      {
        category: "charity_ngo",
        terms: [
          "charity relief",
          "humanitarian aid",
          "donation campaign",
          "non-profit organization",
          "relief fund",
          "donate now to support"
        ],
        entityTokens: ["charity", "foundation", "relief", "humanitarian", "donation", "ngo"],
        penalty: -0.55
      }
    ];
    STOP_WORDS = /* @__PURE__ */ new Set([
      "a",
      "about",
      "above",
      "after",
      "again",
      "against",
      "all",
      "am",
      "an",
      "and",
      "any",
      "are",
      "aren",
      "as",
      "at",
      "be",
      "because",
      "been",
      "before",
      "being",
      "below",
      "between",
      "both",
      "but",
      "by",
      "can",
      "cannot",
      "could",
      "did",
      "do",
      "does",
      "doing",
      "down",
      "during",
      "each",
      "few",
      "for",
      "from",
      "further",
      "had",
      "has",
      "have",
      "having",
      "he",
      "her",
      "here",
      "hers",
      "herself",
      "him",
      "himself",
      "his",
      "how",
      "i",
      "if",
      "in",
      "into",
      "is",
      "it",
      "its",
      "itself",
      "just",
      "me",
      "more",
      "most",
      "my",
      "myself",
      "no",
      "nor",
      "not",
      "now",
      "of",
      "off",
      "on",
      "once",
      "only",
      "or",
      "other",
      "ought",
      "our",
      "ours",
      "ourselves",
      "out",
      "over",
      "own",
      "same",
      "she",
      "should",
      "so",
      "some",
      "such",
      "than",
      "that",
      "the",
      "their",
      "theirs",
      "them",
      "themselves",
      "then",
      "there",
      "these",
      "they",
      "this",
      "those",
      "through",
      "to",
      "too",
      "under",
      "until",
      "up",
      "very",
      "was",
      "we",
      "were",
      "what",
      "when",
      "where",
      "which",
      "while",
      "who",
      "whom",
      "why",
      "with",
      "would",
      "you",
      "your",
      "yours",
      "yourself",
      "yourselves"
    ]);
    LeadRelevanceEngine = class _LeadRelevanceEngine {
      static {
        this.VERSION = RELEVANCE_STRATEGY_VERSION;
      }
      static {
        this.ENGINE_VERSION = RELEVANCE_ENGINE_VERSION;
      }
      static {
        this.compileResearchIntent = compileResearchIntent;
      }
      /**
       * Evaluates a single candidate ad against the research intent using the Multi-Stage Pipeline.
       */
      static evaluateCandidate(candidate, intent) {
        const evidence = {
          advertiserName: candidate.pageName || candidate.advertiserName || "",
          adText: candidate.bodyCopy || candidate.adText || "",
          destinationUrl: candidate.destinationUrl,
          destinationDomain: candidate.destinationDomain,
          facebookPageName: candidate.facebookPageName || candidate.pageName,
          facebookPageUrl: candidate.facebookPageUrl,
          ctaText: candidate.ctaText,
          matchedKeyword: candidate.observedKeyword || candidate.matchedKeyword
        };
        return this.evaluateEvidence(evidence, intent);
      }
      /**
       * Evaluates structured candidate evidence against research intent.
       * Deterministic, explainable, and bounded.
       */
      static evaluateEvidence(evidence, intent) {
        const normalized = normalizeEvidence(evidence);
        const structuredEvidence = [];
        const conflicts = [];
        const reasons = [];
        const matchedKeywords = [];
        const matchedTerms = [];
        const negativeSignals = [];
        const allQueryPhrases = [
          ...intent.primaryKeywords || intent.keywords || [],
          ...intent.secondaryKeywords || []
        ].map((k) => k.toLowerCase().trim()).filter(Boolean);
        const activeTaxonomies = [];
        for (const [key, tax] of Object.entries(BOUNDED_TAXONOMY)) {
          if (allQueryPhrases.some(
            (phrase) => phrase.includes(key) || tax.rootTerms.some((rt) => phrase.includes(rt))
          )) {
            activeTaxonomies.push(tax);
          }
        }
        if (activeTaxonomies.length === 0 && allQueryPhrases.length > 0) {
          const dynamicRoots = [];
          const dynamicStems = [];
          for (const phrase of allQueryPhrases) {
            dynamicRoots.push(phrase);
            for (const tok of tokenizeText(phrase)) {
              dynamicStems.push(tok);
            }
          }
          activeTaxonomies.push({
            category: allQueryPhrases[0],
            rootTerms: Array.from(new Set(dynamicRoots)),
            productServiceTerms: Array.from(new Set(dynamicStems)),
            industryDescriptors: allQueryPhrases,
            conflictingCategories: ["sports", "healthcare", "politics", "gaming", "casino"]
          });
        }
        const coreQueryTokens = /* @__PURE__ */ new Set();
        for (const phrase of allQueryPhrases) {
          for (const t of tokenizeText(phrase)) {
            coreQueryTokens.add(t);
          }
        }
        for (const tax of activeTaxonomies) {
          for (const rt of tax.rootTerms) {
            for (const t of tokenizeText(rt)) {
              coreQueryTokens.add(t);
            }
          }
        }
        const productTerms = /* @__PURE__ */ new Set();
        for (const tax of activeTaxonomies) {
          for (const t of tax.productServiceTerms) {
            productTerms.add(stemToken(t));
          }
        }
        let negativePenalty = 0;
        if (intent.exclusions && intent.exclusions.length > 0) {
          for (const excl of intent.exclusions) {
            const exclLower = excl.toLowerCase();
            if (normalized.advertiserText.includes(exclLower) || normalized.adCopyText.includes(exclLower) || normalized.normalizedDomain.includes(exclLower)) {
              const reason = `Matched preset exclusion rule: "${excl}"`;
              negativeSignals.push(reason);
              conflicts.push({
                type: "CONTRADICTION",
                strength: "STRONG",
                source: "advertiser_name",
                reason,
                matchedSignal: excl,
                reasonCode: "REJECT_PRESET_EXCLUSION"
              });
              negativePenalty -= 0.55;
              break;
            }
          }
        }
        for (const negCat of NEGATIVE_CATEGORIES) {
          const isQueryRelatedToNegCat = allQueryPhrases.some(
            (q) => negCat.terms.some((t) => q.includes(t)) || q.includes(negCat.category) || negCat.category === "sports" && (q.includes("football") || q.includes("cricket") || q.includes("sports"))
          );
          if (isQueryRelatedToNegCat) continue;
          let entityContradictionTerm;
          for (const term of negCat.terms) {
            if (normalized.advertiserText.includes(term) || normalized.normalizedDomain.includes(term.replace(/\s+/g, ""))) {
              entityContradictionTerm = term;
              break;
            }
          }
          if (entityContradictionTerm) {
            const reason = `Advertiser entity identity belongs to unrelated category (${negCat.category}): "${entityContradictionTerm}"`;
            negativeSignals.push(reason);
            conflicts.push({
              type: "CONTRADICTION",
              strength: "STRONG",
              source: "advertiser_name",
              reason,
              matchedSignal: entityContradictionTerm,
              reasonCode: "REJECT_CONTRADICTION_IDENTITY"
            });
            negativePenalty += negCat.penalty;
            continue;
          }
          for (const term of negCat.terms) {
            if (normalized.adCopyText.includes(term) || normalized.normalizedDomain.includes(term.replace(/\s+/g, ""))) {
              const reason = `Unrelated ${negCat.category} signal detected in candidate ad context: "${term}"`;
              negativeSignals.push(reason);
              conflicts.push({
                type: "NEGATIVE_CATEGORY",
                strength: "STRONG",
                source: "ad_text",
                reason,
                matchedSignal: term,
                reasonCode: "REJECT_CONFLICT"
              });
              negativePenalty += negCat.penalty;
              break;
            }
          }
        }
        negativePenalty = Math.max(-0.8, negativePenalty);
        let advertiserNameScore = 0;
        let hasStrongEntityMatch = false;
        let hasModerateEntityMatch = false;
        for (const phrase of allQueryPhrases) {
          if (normalized.advertiserText.includes(phrase)) {
            advertiserNameScore = 0.4;
            hasStrongEntityMatch = true;
            matchedKeywords.push(phrase);
            matchedTerms.push(phrase);
            const reason = `Advertiser name explicitly contains target category query "${phrase}"`;
            reasons.push(reason);
            structuredEvidence.push({
              type: "ENTITY_IDENTITY",
              strength: "STRONG",
              source: "advertiser_name",
              reason,
              matchedSignal: phrase,
              reasonCode: "SIGNAL_ENTITY_NAME_EXACT"
            });
            break;
          }
        }
        if (!hasStrongEntityMatch) {
          const matchedTokensInName = normalized.normalizedAdvertiserTokens.filter((t) => coreQueryTokens.has(t));
          if (matchedTokensInName.length > 0) {
            advertiserNameScore = 0.3;
            hasStrongEntityMatch = true;
            matchedTerms.push(...matchedTokensInName);
            const reason = `Advertiser name contains core target keyword stem(s): ${matchedTokensInName.join(", ")}`;
            reasons.push(reason);
            structuredEvidence.push({
              type: "ENTITY_IDENTITY",
              strength: "STRONG",
              source: "advertiser_name",
              reason,
              matchedSignal: matchedTokensInName.join(", "),
              reasonCode: "SIGNAL_ENTITY_NAME_CORE"
            });
          } else {
            const productTokensInName = normalized.normalizedAdvertiserTokens.filter((t) => productTerms.has(t));
            const matchedSubstringProduct = Array.from(productTerms).filter(
              (pt) => pt.length >= 4 && normalized.advertiserText.includes(pt)
            );
            const combinedProductMatches = Array.from(/* @__PURE__ */ new Set([...productTokensInName, ...matchedSubstringProduct]));
            if (combinedProductMatches.length > 0) {
              advertiserNameScore = 0.25;
              hasModerateEntityMatch = true;
              matchedTerms.push(...combinedProductMatches);
              const reason = `Advertiser name contains target product term(s): ${combinedProductMatches.join(", ")}`;
              reasons.push(reason);
              structuredEvidence.push({
                type: "ENTITY_IDENTITY",
                strength: "MODERATE",
                source: "advertiser_name",
                reason,
                matchedSignal: combinedProductMatches.join(", "),
                reasonCode: "SIGNAL_ENTITY_NAME_PRODUCT"
              });
            }
          }
        }
        let destinationScore = 0;
        let hasDomainCategoryMatch = false;
        if (normalized.normalizedDomain) {
          const domainHasQuery = allQueryPhrases.some(
            (p) => normalized.normalizedDomain.includes(p.replace(/\s+/g, ""))
          );
          const domainHasProduct = Array.from(productTerms).some(
            (t) => t.length >= 4 && normalized.normalizedDomain.includes(t)
          );
          if (domainHasQuery) {
            destinationScore = 0.2;
            hasDomainCategoryMatch = true;
            const reason = `Destination domain "${normalized.normalizedDomain}" explicitly contains target query`;
            reasons.push(reason);
            structuredEvidence.push({
              type: "ENTITY_IDENTITY",
              strength: "STRONG",
              source: "destination_domain",
              reason,
              matchedSignal: normalized.normalizedDomain,
              reasonCode: "SIGNAL_DOMAIN_QUERY_EXACT"
            });
          } else if (domainHasProduct) {
            destinationScore = 0.15;
            hasDomainCategoryMatch = true;
            const reason = `Destination domain "${normalized.normalizedDomain}" contains category product term`;
            reasons.push(reason);
            structuredEvidence.push({
              type: "ENTITY_IDENTITY",
              strength: "MODERATE",
              source: "destination_domain",
              reason,
              matchedSignal: normalized.normalizedDomain,
              reasonCode: "SIGNAL_DOMAIN_PRODUCT"
            });
          }
        }
        let facebookPageScore = 0;
        if (evidence.facebookPageUrl) {
          const pageUrlLower = evidence.facebookPageUrl.toLowerCase();
          const pageHasQuery = allQueryPhrases.some((p) => pageUrlLower.includes(p.replace(/\s+/g, "")));
          if (pageHasQuery) {
            facebookPageScore = hasStrongEntityMatch ? 0.05 : 0.12;
            const reason = `Facebook Page handle/URL reinforces target category identity`;
            reasons.push(reason);
            structuredEvidence.push({
              type: "ENTITY_IDENTITY",
              strength: "MODERATE",
              source: "facebook_page",
              reason,
              matchedSignal: evidence.facebookPageUrl,
              reasonCode: "SIGNAL_PAGE_HANDLE"
            });
          }
        }
        let adCopyScore = 0;
        let adCopyHasPhraseMatch = false;
        for (const phrase of allQueryPhrases) {
          if (normalized.adCopyText.includes(phrase)) {
            adCopyScore += 0.2;
            adCopyHasPhraseMatch = true;
            if (!matchedKeywords.includes(phrase)) matchedKeywords.push(phrase);
            if (!matchedTerms.includes(phrase)) matchedTerms.push(phrase);
            const reason = `Ad copy directly mentions target query "${phrase}"`;
            reasons.push(reason);
            structuredEvidence.push({
              type: "CATEGORY_MATCH",
              strength: "MODERATE",
              source: "ad_text",
              reason,
              matchedSignal: phrase,
              reasonCode: "SIGNAL_COPY_PHRASE"
            });
            break;
          }
        }
        const foundProductTermsInCopy = Array.from(productTerms).filter(
          (t) => normalized.normalizedAdTextTokens.includes(t) || t.length >= 4 && normalized.adCopyText.includes(t)
        );
        let hasProductCatalogEvidence = false;
        if (foundProductTermsInCopy.length > 0) {
          const sampleTerms = foundProductTermsInCopy.slice(0, 5);
          matchedTerms.push(...sampleTerms);
          if (foundProductTermsInCopy.length >= 2) {
            hasProductCatalogEvidence = true;
            const copyAdd = Math.min(0.35, 0.15 + (foundProductTermsInCopy.length - 1) * 0.06);
            adCopyScore += copyAdd;
            const reason = `Ad copy contains specific category product catalog: ${sampleTerms.join(", ")}`;
            reasons.push(reason);
            structuredEvidence.push({
              type: "CATEGORY_MATCH",
              strength: "STRONG",
              source: "ad_text",
              reason,
              matchedSignal: sampleTerms.join(", "),
              reasonCode: "SIGNAL_COPY_PRODUCT_CATALOG"
            });
          } else {
            adCopyScore += 0.12;
            const reason = `Ad copy mentions category product term: ${sampleTerms[0]}`;
            reasons.push(reason);
            structuredEvidence.push({
              type: "CATEGORY_MATCH",
              strength: "WEAK",
              source: "ad_text",
              reason,
              matchedSignal: sampleTerms[0],
              reasonCode: "SIGNAL_COPY_SINGLE_PRODUCT"
            });
          }
        } else if (!adCopyHasPhraseMatch) {
          const matchedTokensInCopy = normalized.normalizedAdTextTokens.filter((t) => coreQueryTokens.has(t));
          if (matchedTokensInCopy.length > 0) {
            adCopyScore += 0.1;
            matchedTerms.push(...matchedTokensInCopy);
            const reason = `Ad copy mentions keyword stem(s): ${matchedTokensInCopy.join(", ")}`;
            reasons.push(reason);
            structuredEvidence.push({
              type: "CATEGORY_MATCH",
              strength: "WEAK",
              source: "ad_text",
              reason,
              matchedSignal: matchedTokensInCopy.join(", "),
              reasonCode: "SIGNAL_COPY_STEM_ONLY"
            });
          }
        }
        adCopyScore = Math.min(0.4, adCopyScore);
        let hasUrlSlugProduct = false;
        if (normalized.normalizedUrlSlug) {
          const slugHasProduct = Array.from(productTerms).some(
            (t) => t.length >= 4 && normalized.normalizedUrlSlug.includes(t)
          );
          const slugHasQuery = Array.from(coreQueryTokens).some(
            (t) => normalized.normalizedUrlSlug.includes(t)
          );
          if (slugHasProduct || slugHasQuery) {
            hasUrlSlugProduct = true;
            destinationScore = Math.max(destinationScore, 0.12);
            const reason = `Destination URL path contains target product category context`;
            reasons.push(reason);
            structuredEvidence.push({
              type: "CATEGORY_MATCH",
              strength: "MODERATE",
              source: "destination_url",
              reason,
              matchedSignal: normalized.normalizedUrlSlug.substring(0, 50),
              reasonCode: "SIGNAL_URL_SLUG_MATCH"
            });
          }
        }
        let commercialScore = 0;
        const commercialCtas = ["shop now", "buy now", "order now", "get quote", "contact us", "order"];
        const hasCommercialCta = commercialCtas.includes(normalized.normalizedCta);
        if (hasCommercialCta) {
          commercialScore += 0.05;
          structuredEvidence.push({
            type: "COMMERCIAL_INTENT",
            strength: "MODERATE",
            source: "cta_text",
            reason: `Commercial action call-to-action ("${evidence.ctaText}")`,
            matchedSignal: evidence.ctaText,
            reasonCode: "SIGNAL_COMMERCIAL_INTENT_CTA"
          });
        }
        const hasPricingInCopy = /(price|discount|sale|off|taka|bdt|usd|\$|€|£|warranty|deal|buy|shop)/i.test(normalized.adCopyText);
        if (hasPricingInCopy) {
          commercialScore = Math.min(0.1, commercialScore + 0.05);
          structuredEvidence.push({
            type: "COMMERCIAL_INTENT",
            strength: "MODERATE",
            source: "ad_text",
            reason: `Commercial pricing, transaction, or sale language observed in ad copy`,
            reasonCode: "SIGNAL_COMMERCIAL_INTENT_PRICE"
          });
        }
        const rawPositiveScore = advertiserNameScore + adCopyScore + destinationScore + facebookPageScore + commercialScore;
        const totalScore = Math.max(0, Math.min(1, rawPositiveScore + negativePenalty));
        let decision = "UNCERTAIN";
        let confidence = "LOW";
        let reasonCode = "UNCERTAIN_AMBIGUOUS_ENTITY";
        const hasStrongConflict = conflicts.some((c) => c.type === "CONTRADICTION" && c.strength === "STRONG") || negativePenalty <= -0.3;
        if (hasStrongConflict) {
          decision = "NOT_RELEVANT";
          confidence = "HIGH";
          reasonCode = conflicts[0]?.reasonCode || "REJECT_CONFLICT";
          reasons.unshift(`Disqualified by Hard Contradiction Gate: ${negativeSignals.join("; ")}`);
        } else {
          const hasOnlyWeakKeywordInCopy = !hasStrongEntityMatch && !hasModerateEntityMatch && !hasDomainCategoryMatch && !hasProductCatalogEvidence;
          if (hasOnlyWeakKeywordInCopy) {
            if (totalScore < 0.18) {
              decision = "NOT_RELEVANT";
              confidence = "HIGH";
              reasonCode = "REJECT_INSUFFICIENT_EVIDENCE";
              reasons.push(`Classified as NOT_RELEVANT: No entity or category evidence found.`);
            } else {
              decision = "UNCERTAIN";
              confidence = "LOW";
              reasonCode = "UNCERTAIN_KEYWORD_ONLY";
              reasons.push(`Classified as UNCERTAIN: Mentioned keyword but lacks independent entity or product evidence.`);
            }
          } else {
            const hasSupportingSignal = adCopyScore >= 0.1 || destinationScore >= 0.12 || commercialScore >= 0.05 || facebookPageScore >= 0.05 || hasProductCatalogEvidence;
            const passesCriterion1 = hasStrongEntityMatch && hasSupportingSignal;
            const passesCriterion2 = hasModerateEntityMatch && (adCopyScore >= 0.15 || destinationScore >= 0.12 || hasProductCatalogEvidence);
            const passesCriterion3 = hasProductCatalogEvidence && (destinationScore >= 0.12 || hasUrlSlugProduct || hasDomainCategoryMatch || adCopyScore >= 0.25 && commercialScore >= 0.05);
            if ((passesCriterion1 || passesCriterion2 || passesCriterion3) && totalScore >= 0.35) {
              decision = "RELEVANT";
              const hasMultiDimensionalCorroboration = hasStrongEntityMatch && hasSupportingSignal || hasProductCatalogEvidence && destinationScore >= 0.12 && commercialScore >= 0.05;
              confidence = totalScore >= 0.6 || hasMultiDimensionalCorroboration ? "HIGH" : "MEDIUM";
              reasonCode = passesCriterion1 ? "ACCEPT_STRONG_ENTITY_MATCH" : "ACCEPT_MULTI_SIGNAL_MATCH";
              reasons.push(
                `Qualified as RELEVANT: ${passesCriterion1 ? "Strong entity identity confirmed with supporting product/commercial evidence" : passesCriterion3 ? "Category product catalog verified with commercial corroboration" : "Entity and category evidence meet sufficiency standards"} (Confidence: ${confidence})`
              );
            } else if (totalScore < 0.22) {
              decision = "NOT_RELEVANT";
              confidence = totalScore < 0.12 ? "HIGH" : "MEDIUM";
              reasonCode = "REJECT_CATEGORY_MISMATCH";
              reasons.push(`Classified as NOT_RELEVANT: Insufficient category evidence (Score: ${(totalScore * 100).toFixed(0)}%)`);
            } else {
              decision = "UNCERTAIN";
              confidence = "LOW";
              reasonCode = "UNCERTAIN_AMBIGUOUS_ENTITY";
              reasons.push(`Classified as UNCERTAIN: Evidence is ambiguous or insufficient to confirm business vertical.`);
            }
          }
        }
        if (evidence.matchedKeyword && !matchedKeywords.includes(evidence.matchedKeyword)) {
          if (decision === "RELEVANT") {
            matchedKeywords.push(evidence.matchedKeyword);
          }
        }
        return {
          decision,
          confidence,
          score: Math.round(totalScore * 100) / 100,
          reasons,
          matchedKeywords,
          matchedTerms: Array.from(new Set(matchedTerms)),
          negativeSignals,
          evidence: structuredEvidence,
          conflicts,
          evidenceBreakdown: {
            advertiserNameScore,
            adCopyScore,
            destinationScore,
            facebookPageScore,
            commercialScore,
            negativePenalty
          },
          strategyVersion: RELEVANCE_STRATEGY_VERSION,
          engineVersion: RELEVANCE_ENGINE_VERSION,
          presetVersion: intent.presetVersion,
          reasonCode
        };
      }
      /**
       * Entity-Level Evaluation: Evaluates multiple ad cards for an advertiser entity
       * to produce the consolidated entity relevance decision without duplicate inflation.
       */
      static evaluateEntity(advertiserName, candidates, intent) {
        if (candidates.length === 0) {
          return this.evaluateEvidence({ advertiserName }, intent);
        }
        const evaluations = candidates.map((c) => this.evaluateCandidate(c, intent));
        const allConflicts = evaluations.flatMap((e) => e.conflicts);
        const hasEntityContradiction = allConflicts.some(
          (c) => c.type === "CONTRADICTION" && c.strength === "STRONG"
        );
        const allNegativeSignals = Array.from(new Set(evaluations.flatMap((e) => e.negativeSignals)));
        const maxNegativePenalty = Math.min(...evaluations.map((e) => e.evidenceBreakdown.negativePenalty));
        if (hasEntityContradiction || maxNegativePenalty <= -0.3) {
          const worstEval = evaluations.find((e) => e.evidenceBreakdown.negativePenalty <= -0.3) || evaluations[0];
          return {
            ...worstEval,
            decision: "NOT_RELEVANT",
            confidence: "HIGH",
            negativeSignals: allNegativeSignals,
            conflicts: allConflicts,
            reasons: [
              `Entity disqualified across ${candidates.length} ad(s) due to hard contradiction: ${allNegativeSignals.join("; ")}`
            ],
            reasonCode: "REJECT_CONTRADICTION_IDENTITY",
            engineVersion: RELEVANCE_ENGINE_VERSION,
            strategyVersion: RELEVANCE_STRATEGY_VERSION
          };
        }
        const seenCopyHashes = /* @__PURE__ */ new Set();
        const distinctAds = [];
        for (const c of candidates) {
          const copyNormalized = (c.bodyCopy || "").toLowerCase().trim().replace(/\s+/g, " ").substring(0, 100);
          if (!seenCopyHashes.has(copyNormalized)) {
            seenCopyHashes.add(copyNormalized);
            distinctAds.push(c);
          }
        }
        evaluations.sort((a, b) => b.score - a.score);
        const bestEval = evaluations[0];
        const combinedKeywords = Array.from(new Set(evaluations.flatMap((e) => e.matchedKeywords)));
        const combinedTerms = Array.from(new Set(evaluations.flatMap((e) => e.matchedTerms)));
        const allEvidence = Array.from(
          new Map(evaluations.flatMap((e) => e.evidence).map((ev) => [`${ev.type}:${ev.source}:${ev.reasonCode}`, ev])).values()
        );
        let consolidatedScore = bestEval.score;
        let decision = bestEval.decision;
        let confidence = bestEval.confidence;
        let reasonCode = bestEval.reasonCode;
        const distinctSupportingAds = distinctAds.filter((ad) => {
          const ev = _LeadRelevanceEngine.evaluateCandidate(ad, intent);
          return ev.decision === "RELEVANT" || ev.evidence.some((e) => e.type === "CATEGORY_MATCH");
        });
        if (allNegativeSignals.length === 0 && distinctSupportingAds.length > 1) {
          const multiCardBoost = Math.min(0.12, (distinctSupportingAds.length - 1) * 0.04);
          consolidatedScore = Math.min(1, consolidatedScore + multiCardBoost);
          if (decision === "UNCERTAIN" && consolidatedScore >= 0.4 && (bestEval.evidenceBreakdown.advertiserNameScore > 0 || bestEval.evidenceBreakdown.adCopyScore >= 0.25)) {
            decision = "RELEVANT";
            reasonCode = "ACCEPT_MULTI_SIGNAL_MATCH";
          }
          if (consolidatedScore >= 0.6) {
            confidence = "HIGH";
          }
          allEvidence.push({
            type: "ENTITY_IDENTITY",
            strength: "STRONG",
            source: "entity_aggregation",
            reason: `Entity confirmed across ${distinctSupportingAds.length} distinct category ads`,
            matchedSignal: `${distinctSupportingAds.length} distinct ads`,
            reasonCode: "SIGNAL_MULTI_AD_CORROBORATION"
          });
        }
        return {
          ...bestEval,
          decision,
          confidence,
          score: Math.round(consolidatedScore * 100) / 100,
          matchedKeywords: combinedKeywords.length > 0 ? combinedKeywords : bestEval.matchedKeywords,
          matchedTerms: combinedTerms,
          evidence: allEvidence,
          conflicts: allConflicts,
          reasons: [
            `Entity evaluated across ${candidates.length} ad card(s) (${distinctAds.length} distinct): status ${decision} (${(consolidatedScore * 100).toFixed(0)}%)`,
            ...bestEval.reasons
          ],
          reasonCode,
          strategyVersion: RELEVANCE_STRATEGY_VERSION,
          engineVersion: RELEVANCE_ENGINE_VERSION
        };
      }
      /**
       * Evidence Waterfall + Strict Relevance v3 Evaluator
       * Executes deterministic evidence collection, anti-inflation aggregation,
       * and strict multi-tier decision hierarchy.
       */
      static evaluateCandidateV3(candidate, intent) {
        const { evaluateStrictRelevanceV3: evaluateStrictRelevanceV32 } = (init_evidenceWaterfall(), __toCommonJS(evidenceWaterfall_exports));
        const candEvidence = {
          advertiserName: candidate.pageName || candidate.advertiserName || "",
          adText: candidate.bodyCopy || candidate.adText || "",
          destinationUrl: candidate.destinationUrl,
          destinationDomain: candidate.destinationDomain,
          facebookPageUrl: candidate.facebookPageUrl,
          ctaText: candidate.ctaText,
          matchedKeyword: candidate.observedKeyword || candidate.matchedKeyword
        };
        return evaluateStrictRelevanceV32(candEvidence, intent);
      }
    };
  }
});

// src/extension/types.ts
var MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH = 5e3;

// src/extension/service-worker.ts
init_relevanceEngine();

// src/extension/bulkStore.ts
var DB_NAME = "leadnoria-research";
var DB_VERSION = 2;
var MemoryStoreFallback = class {
  constructor() {
    this.runs = /* @__PURE__ */ new Map();
    this.ads = /* @__PURE__ */ new Map();
    // key: `${runId}_${libraryId}`
    this.entities = /* @__PURE__ */ new Map();
    // key: `${runId}_${canonicalKey}`
    this.uncertainEntities = /* @__PURE__ */ new Map();
    // key: `${runId}_${entityId}`
    this.advertiserExpansions = /* @__PURE__ */ new Map();
    // key: runId
    this.evidence = /* @__PURE__ */ new Map();
    // key: `${runId}_${canonicalKey}`
    this.checkpoints = /* @__PURE__ */ new Map();
    // key: `${runId}_${batchIndex}`
    this.dedupAds = /* @__PURE__ */ new Map();
    // runId -> Set<libraryId>
    this.dedupEntities = /* @__PURE__ */ new Map();
  }
  // runId -> Set<canonicalKey>
  async saveRun(run) {
    this.runs.set(run.runId, JSON.parse(JSON.stringify(run)));
  }
  async getRun(runId) {
    const r = this.runs.get(runId);
    return r ? JSON.parse(JSON.stringify(r)) : null;
  }
  async saveBatch(runId, payload) {
    if (!this.dedupAds.has(runId)) this.dedupAds.set(runId, /* @__PURE__ */ new Set());
    if (!this.dedupEntities.has(runId)) this.dedupEntities.set(runId, /* @__PURE__ */ new Set());
    const adSet = this.dedupAds.get(runId);
    const entSet = this.dedupEntities.get(runId);
    for (const ad of payload.ads) {
      this.ads.set(`${runId}_${ad.libraryId}`, { ...ad, runId });
      adSet.add(ad.libraryId);
    }
    for (const ent of payload.entities) {
      const canonicalKey = ent.canonicalName ? ent.canonicalName.toLowerCase() : ent.name.toLowerCase();
      this.entities.set(`${runId}_${canonicalKey}`, { ...ent, runId, canonicalKey });
      entSet.add(canonicalKey);
    }
    if (payload.uncertainEntities) {
      for (const unc of payload.uncertainEntities) {
        this.uncertainEntities.set(`${runId}_${unc.entityId}`, { ...unc, runId });
      }
    }
    if (payload.advertiserExpansions) {
      const list = this.advertiserExpansions.get(runId) || [];
      list.push(...payload.advertiserExpansions);
      this.advertiserExpansions.set(runId, list);
    }
    if (payload.evidence) {
      for (const ev of payload.evidence) {
        this.evidence.set(`${runId}_${ev.canonicalKey}`, ev.evidence);
      }
    }
    this.checkpoints.set(`${runId}_${payload.batchIndex}`, payload.checkpoint);
  }
  async getAllRelevantLeads(runId) {
    const results = [];
    for (const [key, ent] of this.entities.entries()) {
      if (key.startsWith(`${runId}_`)) {
        if ((!ent.relevanceDecision || ent.relevanceDecision === "RELEVANT") && ent.evaluationStatus !== "UNCERTAIN" && ent.evaluationStatus !== "REJECTED") {
          results.push(JSON.parse(JSON.stringify(ent)));
        }
      }
    }
    return results;
  }
  async getAllUncertainEntities(runId) {
    const list = [];
    for (const [key, unc] of this.uncertainEntities.entries()) {
      if (key.startsWith(`${runId}_`)) {
        list.push(JSON.parse(JSON.stringify(unc)));
      }
    }
    return list;
  }
  async getAllAdvertiserExpansions(runId) {
    return JSON.parse(JSON.stringify(this.advertiserExpansions.get(runId) || []));
  }
  async getEntity(runId, canonicalKey) {
    const ent = this.entities.get(`${runId}_${canonicalKey.toLowerCase()}`);
    return ent ? JSON.parse(JSON.stringify(ent)) : null;
  }
  async getSeenAdIds(runId) {
    return new Set(this.dedupAds.get(runId) || []);
  }
  async getSeenEntityKeys(runId) {
    return new Set(this.dedupEntities.get(runId) || []);
  }
  async getLatestCheckpoint(runId) {
    let latestIndex = -1;
    let latestCp = null;
    for (const [key, cp] of this.checkpoints.entries()) {
      if (key.startsWith(`${runId}_`)) {
        if (cp.batchIndex > latestIndex) {
          latestIndex = cp.batchIndex;
          latestCp = cp;
        }
      }
    }
    return latestCp ? JSON.parse(JSON.stringify(latestCp)) : null;
  }
  async getStorageStats(runId) {
    let totalAds = 0;
    let totalEntities = 0;
    let totalRelevant = 0;
    let totalCheckpoints = 0;
    let bytes = 0;
    for (const [k, v] of this.ads.entries()) {
      if (k.startsWith(`${runId}_`)) {
        totalAds++;
        bytes += JSON.stringify(v).length;
      }
    }
    for (const [k, v] of this.entities.entries()) {
      if (k.startsWith(`${runId}_`)) {
        totalEntities++;
        if (!v.relevanceDecision || v.relevanceDecision === "RELEVANT") totalRelevant++;
        bytes += JSON.stringify(v).length;
      }
    }
    for (const [k, v] of this.checkpoints.entries()) {
      if (k.startsWith(`${runId}_`)) {
        totalCheckpoints++;
        bytes += JSON.stringify(v).length;
      }
    }
    return {
      runId,
      totalAds,
      totalEntities,
      totalRelevantLeads: totalRelevant,
      totalCheckpoints,
      estimatedBytes: bytes
    };
  }
  async clearRun(runId) {
    this.runs.delete(runId);
    this.dedupAds.delete(runId);
    this.dedupEntities.delete(runId);
    for (const k of Array.from(this.ads.keys())) {
      if (k.startsWith(`${runId}_`)) this.ads.delete(k);
    }
    for (const k of Array.from(this.entities.keys())) {
      if (k.startsWith(`${runId}_`)) this.entities.delete(k);
    }
    for (const k of Array.from(this.evidence.keys())) {
      if (k.startsWith(`${runId}_`)) this.evidence.delete(k);
    }
    for (const k of Array.from(this.checkpoints.keys())) {
      if (k.startsWith(`${runId}_`)) this.checkpoints.delete(k);
    }
  }
};
var memoryFallback = new MemoryStoreFallback();
function hasIndexedDB() {
  return typeof indexedDB !== "undefined" && indexedDB !== null;
}
function openDB() {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDB()) {
      return reject(new Error("IndexedDB not available"));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("runs")) {
        db.createObjectStore("runs", { keyPath: "runId" });
      }
      if (!db.objectStoreNames.contains("ads")) {
        const adStore = db.createObjectStore("ads", { keyPath: ["runId", "libraryId"] });
        adStore.createIndex("by_run", "runId", { unique: false });
      }
      if (!db.objectStoreNames.contains("entities")) {
        const entStore = db.createObjectStore("entities", { keyPath: ["runId", "canonicalKey"] });
        entStore.createIndex("by_run", "runId", { unique: false });
        entStore.createIndex("by_run_decision", ["runId", "relevanceDecision"], { unique: false });
      }
      if (!db.objectStoreNames.contains("evidence")) {
        const evStore = db.createObjectStore("evidence", { keyPath: ["runId", "canonicalKey"] });
        evStore.createIndex("by_run", "runId", { unique: false });
      }
      if (!db.objectStoreNames.contains("checkpoints")) {
        const cpStore = db.createObjectStore("checkpoints", { keyPath: ["runId", "batchIndex"] });
        cpStore.createIndex("by_run", "runId", { unique: false });
      }
      if (!db.objectStoreNames.contains("dedupIndex")) {
        const dedupStore = db.createObjectStore("dedupIndex", { keyPath: ["runId", "idType", "idVal"] });
        dedupStore.createIndex("by_run", "runId", { unique: false });
      }
      if (!db.objectStoreNames.contains("uncertain_entities")) {
        const uncStore = db.createObjectStore("uncertain_entities", { keyPath: ["runId", "entityId"] });
        uncStore.createIndex("by_run", "runId", { unique: false });
      }
      if (!db.objectStoreNames.contains("advertiser_expansions")) {
        const expStore = db.createObjectStore("advertiser_expansions", { keyPath: ["runId", "sourceEntityId"] });
        expStore.createIndex("by_run", "runId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function initBulkStore() {
  if (!hasIndexedDB()) {
    return false;
  }
  try {
    const db = await openDB();
    db.close();
    return true;
  } catch (err) {
    console.warn("[bulkStore] IndexedDB init failed, using memory fallback:", err);
    return false;
  }
}
async function saveRunRecord(run) {
  if (!hasIndexedDB()) {
    return memoryFallback.saveRun(run);
  }
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction("runs", "readwrite");
      tx.objectStore("runs").put(run);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    return memoryFallback.saveRun(run);
  }
}
async function saveBatch(runId, payload) {
  if (!hasIndexedDB()) {
    return memoryFallback.saveBatch(runId, payload);
  }
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const storeNames = ["ads", "entities", "evidence", "checkpoints", "dedupIndex"];
      if (db.objectStoreNames.contains("uncertain_entities")) storeNames.push("uncertain_entities");
      if (db.objectStoreNames.contains("advertiser_expansions")) storeNames.push("advertiser_expansions");
      const tx = db.transaction(storeNames, "readwrite");
      const adStore = tx.objectStore("ads");
      const entStore = tx.objectStore("entities");
      const evStore = tx.objectStore("evidence");
      const cpStore = tx.objectStore("checkpoints");
      const dedupStore = tx.objectStore("dedupIndex");
      for (const ad of payload.ads) {
        adStore.put({ ...ad, runId });
        dedupStore.put({ runId, idType: "AD_ID", idVal: ad.libraryId });
      }
      for (const ent of payload.entities) {
        const canonicalKey = ent.canonicalName ? ent.canonicalName.toLowerCase() : ent.name.toLowerCase();
        entStore.put({ ...ent, runId, canonicalKey });
        dedupStore.put({ runId, idType: "ENTITY_KEY", idVal: canonicalKey });
      }
      if (payload.evidence) {
        for (const ev of payload.evidence) {
          evStore.put({ runId, canonicalKey: ev.canonicalKey, evidence: ev.evidence });
        }
      }
      if (payload.uncertainEntities && db.objectStoreNames.contains("uncertain_entities")) {
        const uncStore = tx.objectStore("uncertain_entities");
        for (const unc of payload.uncertainEntities) {
          uncStore.put({ ...unc, runId });
        }
      }
      if (payload.advertiserExpansions && db.objectStoreNames.contains("advertiser_expansions")) {
        const expStore = tx.objectStore("advertiser_expansions");
        for (const exp of payload.advertiserExpansions) {
          expStore.put({ ...exp, runId });
        }
      }
      cpStore.put({ ...payload.checkpoint, runId, batchIndex: payload.batchIndex });
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    return memoryFallback.saveBatch(runId, payload);
  }
}
async function getAllRelevantLeads(runId) {
  if (!hasIndexedDB()) {
    return memoryFallback.getAllRelevantLeads(runId);
  }
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("entities", "readonly");
      const store = tx.objectStore("entities");
      const index = store.index("by_run");
      const request = index.getAll(runId);
      request.onsuccess = () => {
        db.close();
        const records = request.result || [];
        const relevant = records.filter(
          (r) => (!r.relevanceDecision || r.relevanceDecision === "RELEVANT") && r.evaluationStatus !== "UNCERTAIN" && r.evaluationStatus !== "REJECTED"
        );
        resolve(relevant);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    return memoryFallback.getAllRelevantLeads(runId);
  }
}
async function getSeenAdIds(runId) {
  if (!hasIndexedDB()) {
    return memoryFallback.getSeenAdIds(runId);
  }
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("dedupIndex", "readonly");
      const store = tx.objectStore("dedupIndex");
      const index = store.index("by_run");
      const request = index.getAll(runId);
      request.onsuccess = () => {
        db.close();
        const items = request.result || [];
        const ids = /* @__PURE__ */ new Set();
        for (const it of items) {
          if (it.idType === "AD_ID") ids.add(it.idVal);
        }
        resolve(ids);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    return memoryFallback.getSeenAdIds(runId);
  }
}
async function getSeenEntityKeys(runId) {
  if (!hasIndexedDB()) {
    return memoryFallback.getSeenEntityKeys(runId);
  }
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("dedupIndex", "readonly");
      const store = tx.objectStore("dedupIndex");
      const index = store.index("by_run");
      const request = index.getAll(runId);
      request.onsuccess = () => {
        db.close();
        const items = request.result || [];
        const keys = /* @__PURE__ */ new Set();
        for (const it of items) {
          if (it.idType === "ENTITY_KEY") keys.add(it.idVal);
        }
        resolve(keys);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    return memoryFallback.getSeenEntityKeys(runId);
  }
}

// src/extension/bulkProcessor.ts
init_relevanceEngine();
init_evidenceWaterfall();

// src/extension/entityResolver.ts
var GENERIC_SHARED_DOMAINS = /* @__PURE__ */ new Set([
  "facebook.com",
  "web.facebook.com",
  "m.facebook.com",
  "l.facebook.com",
  "instagram.com",
  "wa.me",
  "api.whatsapp.com",
  "whatsapp.com",
  "t.me",
  "telegram.me",
  "youtube.com",
  "youtu.be",
  "linktr.ee",
  "bio.link",
  "beacons.ai",
  "campsite.bio",
  "forms.gle",
  "docs.google.com",
  "drive.google.com",
  "google.com",
  "typeform.com",
  "calendly.com",
  "bit.ly",
  "tinyurl.com",
  "ow.ly",
  "rebrand.ly",
  "t.co",
  "amazon.com",
  "amazon.co.uk",
  "amazon.in",
  "amazon.de",
  "ebay.com",
  "etsy.com",
  "daraz.com.bd",
  "daraz.pk",
  "daraz.lk",
  "walmart.com",
  "target.com",
  "aliexpress.com",
  "alibaba.com",
  "myshopify.com",
  "shopee.com",
  "lazada.com"
]);
var SHORT_GENERIC_BRAND_TOKENS = /* @__PURE__ */ new Set([
  "apex",
  "nova",
  "home",
  "design",
  "elite",
  "furniture",
  "store",
  "shop",
  "studio",
  "center",
  "mart",
  "market",
  "group",
  "house",
  "city",
  "star",
  "royal",
  "classic",
  "modern",
  "prime",
  "best",
  "super",
  "mega",
  "global"
]);
var LEGAL_SUFFIXES = [
  "llc",
  "l.l.c.",
  "inc",
  "inc.",
  "incorporated",
  "corp",
  "corp.",
  "corporation",
  "ltd",
  "ltd.",
  "limited",
  "gmbh",
  "co",
  "co.",
  "company",
  "pvt",
  "pvt.",
  "private limited",
  "enterprises",
  "holdings",
  "group"
];
function normalizeAdvertiserName(rawName) {
  let name = (rawName || "").trim();
  if (!name || name === "Unknown Advertiser") return "Unknown Advertiser";
  name = name.replace(/\s*·\s*Sponsored.*$/i, "");
  name = name.replace(/\s*Sponsored.*$/i, "");
  name = name.replace(/\s+page$/i, "");
  name = name.replace(/\s*\(official\)$/i, "");
  name = name.replace(/\s*\(verified\)$/i, "");
  name = name.replace(/\s+/g, " ");
  return name.trim();
}
function getComparisonNameKey(name) {
  let clean = normalizeAdvertiserName(name).normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  for (const s of LEGAL_SUFFIXES) {
    const regex = new RegExp(`\\b${s}\\b$`, "i");
    clean = clean.replace(regex, "").trim();
  }
  return clean;
}
function isShortGenericName(name) {
  const comp = getComparisonNameKey(name);
  if (!comp || comp.length <= 4) return true;
  const tokens = comp.split(/\s+/).filter(Boolean);
  if (tokens.length === 1 && SHORT_GENERIC_BRAND_TOKENS.has(tokens[0])) {
    return true;
  }
  return false;
}
function detectBranchRelationship(nameA, nameB, precomputedA, precomputedB) {
  const a = precomputedA !== void 0 ? precomputedA : getComparisonNameKey(nameA);
  const b = precomputedB !== void 0 ? precomputedB : getComparisonNameKey(nameB);
  if (!a || !b || a === b) return { isBranchVariant: false };
  if (a[0] !== b[0]) return { isBranchVariant: false };
  if (a.startsWith(b) && a.length > b.length) {
    return { isBranchVariant: true, baseBrand: b };
  }
  if (b.startsWith(a) && b.length > a.length) {
    return { isBranchVariant: true, baseBrand: a };
  }
  return { isBranchVariant: false };
}
function normalizeFacebookPage(rawUrl, explicitPageId) {
  if (!rawUrl && !explicitPageId) {
    return {};
  }
  let pageId = explicitPageId?.trim();
  let pageSlug;
  let canonicalUrl;
  if (rawUrl) {
    try {
      const u = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
      const qId = u.searchParams.get("id");
      if (qId && /^\d+$/.test(qId)) {
        pageId = pageId || qId;
      }
      const segments = u.pathname.split("/").map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (segments.length > 0) {
        const first = segments[0];
        if (first === "profile.php") {
        } else if (first === "pages" && segments.length >= 2) {
          pageSlug = segments[1];
          const possibleId = segments[2];
          if (possibleId && /^\d+$/.test(possibleId)) {
            pageId = pageId || possibleId;
          }
        } else if (!["ads", "events", "groups", "help", "marketplace"].includes(first)) {
          pageSlug = first;
          if (/^\d+$/.test(first)) {
            pageId = pageId || first;
          }
        }
      }
    } catch {
      pageSlug = rawUrl.toLowerCase().replace(/[^a-z0-9]/g, "");
    }
  }
  if (pageSlug) {
    canonicalUrl = `https://www.facebook.com/${pageSlug}/`;
  } else if (pageId) {
    canonicalUrl = `https://www.facebook.com/${pageId}/`;
  }
  return {
    rawUrl,
    canonicalUrl,
    pageId,
    pageSlug
  };
}
function normalizeDestinationDomain(rawUrl, rawDomain) {
  let targetUrl = (rawUrl || "").trim();
  if (targetUrl.includes("facebook.com/l.php")) {
    try {
      const parsed = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);
      const shimmed = parsed.searchParams.get("u");
      if (shimmed) {
        targetUrl = decodeURIComponent(shimmed);
      }
    } catch {
    }
  }
  let canonicalDomain = (rawDomain || "").toLowerCase().trim();
  let cleanUrl = targetUrl;
  if (targetUrl) {
    try {
      const u = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);
      canonicalDomain = u.hostname.toLowerCase().replace(/^(www\.|m\.|l\.)/, "");
      const trackingParams = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "fbclid",
        "gclid",
        "ref",
        "source",
        "tracking",
        "_ga"
      ];
      for (const p of trackingParams) {
        u.searchParams.delete(p);
      }
      cleanUrl = u.toString().replace(/\/$/, "");
    } catch {
      canonicalDomain = canonicalDomain.replace(/^(www\.|m\.|l\.)/, "");
    }
  }
  const isShared = Boolean(canonicalDomain && GENERIC_SHARED_DOMAINS.has(canonicalDomain));
  return {
    canonicalDomain: canonicalDomain || void 0,
    isSharedMarketplace: isShared,
    cleanUrl: cleanUrl || void 0
  };
}
var EntityResolutionIndex = class {
  constructor() {
    this.pageIdToKey = /* @__PURE__ */ new Map();
    this.pageSlugToKey = /* @__PURE__ */ new Map();
    this.nameDomainToKey = /* @__PURE__ */ new Map();
    this.specificNameToKey = /* @__PURE__ */ new Map();
    this.brandPrefixToKeys = /* @__PURE__ */ new Map();
  }
  indexEntity(entityKey, lead) {
    if (lead.canonicalPageId) {
      this.pageIdToKey.set(lead.canonicalPageId, entityKey);
    }
    if (lead.canonicalPageSlug) {
      this.pageSlugToKey.set(lead.canonicalPageSlug, entityKey);
    }
    if (lead.facebookPageUrl) {
      const norm = normalizeFacebookPage(lead.facebookPageUrl, lead.canonicalPageId);
      if (norm.pageSlug) this.pageSlugToKey.set(norm.pageSlug, entityKey);
      if (norm.pageId) this.pageIdToKey.set(norm.pageId, entityKey);
    }
    const compName = getComparisonNameKey(lead.name);
    const domain = lead.destinationDomain?.toLowerCase();
    if (compName && domain && !GENERIC_SHARED_DOMAINS.has(domain)) {
      this.nameDomainToKey.set(`${compName}__${domain}`, entityKey);
    }
    if (compName && !isShortGenericName(lead.name)) {
      this.specificNameToKey.set(compName, entityKey);
    }
    if (compName && compName.length >= 2) {
      const prefix = compName.slice(0, 2);
      let list = this.brandPrefixToKeys.get(prefix);
      if (!list) {
        list = [];
        this.brandPrefixToKeys.set(prefix, list);
      }
      list.push(entityKey);
    }
  }
  clear() {
    this.pageIdToKey.clear();
    this.pageSlugToKey.clear();
    this.nameDomainToKey.clear();
    this.specificNameToKey.clear();
    this.brandPrefixToKeys.clear();
  }
};
function evaluateEntityMerge(cand, existingEntities, index) {
  const cleanName = normalizeAdvertiserName(cand.pageName);
  const compName = getComparisonNameKey(cleanName);
  const pageNorm = normalizeFacebookPage(cand.facebookPageUrl, cand.facebookPageId);
  const domainNorm = normalizeDestinationDomain(cand.destinationUrl, cand.destinationDomain);
  if (pageNorm.pageId && index.pageIdToKey.has(pageNorm.pageId)) {
    const targetKey = index.pageIdToKey.get(pageNorm.pageId);
    return {
      shouldMerge: true,
      targetKey,
      confidence: "STRONG",
      reason: `MERGE_EXACT_FACEBOOK_PAGE_ID: Matched Page ID ${pageNorm.pageId}`,
      relationshipType: "INDEPENDENT_BUSINESS"
    };
  }
  if (pageNorm.pageSlug && index.pageSlugToKey.has(pageNorm.pageSlug)) {
    const targetKey = index.pageSlugToKey.get(pageNorm.pageSlug);
    return {
      shouldMerge: true,
      targetKey,
      confidence: "STRONG",
      reason: `MERGE_CANONICAL_FACEBOOK_PAGE_SLUG: Matched Page slug "${pageNorm.pageSlug}"`,
      relationshipType: "INDEPENDENT_BUSINESS"
    };
  }
  if (compName && domainNorm.canonicalDomain && !domainNorm.isSharedMarketplace) {
    const nameDomainKey = `${compName}__${domainNorm.canonicalDomain}`;
    if (index.nameDomainToKey.has(nameDomainKey)) {
      const targetKey = index.nameDomainToKey.get(nameDomainKey);
      const targetEntity = existingEntities.get(targetKey);
      const targetPageNorm = normalizeFacebookPage(targetEntity?.facebookPageUrl, targetEntity?.canonicalPageId);
      if (pageNorm.pageSlug && targetPageNorm.pageSlug && pageNorm.pageSlug !== targetPageNorm.pageSlug) {
        const fallbackKey = `fbslug_${pageNorm.pageSlug}`;
        return {
          shouldMerge: false,
          targetKey: fallbackKey,
          confidence: "MODERATE",
          reason: `NON_MERGE_CONFLICTING_FACEBOOK_PAGE: Shared domain ${domainNorm.canonicalDomain} but distinct Page slugs ("${pageNorm.pageSlug}" vs "${targetPageNorm.pageSlug}")`,
          relationshipType: "INDEPENDENT_BUSINESS"
        };
      }
      return {
        shouldMerge: true,
        targetKey,
        confidence: "STRONG",
        reason: `MERGE_CORROBORATED_NAME_AND_DOMAIN: Matched brand "${cleanName}" and domain "${domainNorm.canonicalDomain}"`,
        relationshipType: "INDEPENDENT_BUSINESS"
      };
    }
  }
  const branchCandidateKeys = compName && compName.length >= 2 ? index.brandPrefixToKeys.get(compName.slice(0, 2)) || [] : Array.from(existingEntities.keys());
  for (const key of branchCandidateKeys) {
    const existing = existingEntities.get(key);
    if (!existing) continue;
    const branchCheck = detectBranchRelationship(cleanName, existing.name, compName);
    if (branchCheck.isBranchVariant) {
      const existingPage = normalizeFacebookPage(existing.facebookPageUrl, existing.canonicalPageId);
      const isSamePage = Boolean(
        pageNorm.pageId && existingPage.pageId && pageNorm.pageId === existingPage.pageId || pageNorm.pageSlug && existingPage.pageSlug && pageNorm.pageSlug === existingPage.pageSlug
      );
      if (!isSamePage) {
        const branchKey = pageNorm.pageSlug ? `fbslug_${pageNorm.pageSlug}` : `branch_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        return {
          shouldMerge: false,
          targetKey: branchKey,
          confidence: "MODERATE",
          reason: `NON_MERGE_LOCAL_BRANCH_DISTINCTION: Distinct local branch detected ("${cleanName}" vs "${existing.name}") without shared Page ID`,
          relationshipType: "LOCAL_BRANCH"
        };
      }
    }
  }
  if (domainNorm.isSharedMarketplace) {
    const key = pageNorm.pageSlug ? `fbslug_${pageNorm.pageSlug}` : `mkp_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    return {
      shouldMerge: false,
      targetKey: key,
      confidence: "MODERATE",
      reason: `NON_MERGE_SHARED_MARKETPLACE_DOMAIN: Shared host/marketplace domain (${domainNorm.canonicalDomain}) cannot trigger automatic merge`,
      relationshipType: "INDEPENDENT_BUSINESS"
    };
  }
  if (isShortGenericName(cleanName)) {
    const uniqueKey = pageNorm.pageSlug ? `fbslug_${pageNorm.pageSlug}` : pageNorm.pageId ? `fbid_${pageNorm.pageId}` : `unres_${cleanName.toLowerCase()}_${cand.libraryId}`;
    return {
      shouldMerge: false,
      targetKey: uniqueKey,
      confidence: "UNRESOLVED",
      reason: `NON_MERGE_GENERIC_NAME_AMBIGUOUS: Short generic brand name "${cleanName}" requires corroborating Page or Domain`,
      relationshipType: "UNRESOLVED_RELATIONSHIP"
    };
  }
  if (compName && index.specificNameToKey.has(compName)) {
    const targetKey = index.specificNameToKey.get(compName);
    const targetEntity = existingEntities.get(targetKey);
    const targetDomainNorm = normalizeDestinationDomain(targetEntity?.destinationUrl, targetEntity?.destinationDomain);
    const targetPageNorm = normalizeFacebookPage(targetEntity?.facebookPageUrl, targetEntity?.canonicalPageId);
    if (domainNorm.canonicalDomain && targetDomainNorm.canonicalDomain && domainNorm.canonicalDomain !== targetDomainNorm.canonicalDomain) {
      const distinctKey = pageNorm.pageSlug ? `fbslug_${pageNorm.pageSlug}` : `dom_${cleanName.toLowerCase()}_${domainNorm.canonicalDomain}`;
      return {
        shouldMerge: false,
        targetKey: distinctKey,
        confidence: "MODERATE",
        reason: `NON_MERGE_CONFLICTING_DESTINATION_DOMAIN: Identical brand name but conflicting domains ("${domainNorm.canonicalDomain}" vs "${targetDomainNorm.canonicalDomain}")`,
        relationshipType: "INDEPENDENT_BUSINESS"
      };
    }
    if (pageNorm.pageSlug && targetPageNorm.pageSlug && pageNorm.pageSlug !== targetPageNorm.pageSlug) {
      const distinctKey = `fbslug_${pageNorm.pageSlug}`;
      return {
        shouldMerge: false,
        targetKey: distinctKey,
        confidence: "MODERATE",
        reason: `NON_MERGE_CONFLICTING_FACEBOOK_PAGE: Identical brand name but conflicting Page slugs ("${pageNorm.pageSlug}" vs "${targetPageNorm.pageSlug}")`,
        relationshipType: "INDEPENDENT_BUSINESS"
      };
    }
    const modKey = pageNorm.pageSlug ? `fbslug_${pageNorm.pageSlug}` : pageNorm.pageId ? `fbid_${pageNorm.pageId}` : domainNorm.canonicalDomain ? `dom_${compName}_${domainNorm.canonicalDomain}` : `cand_${compName}_${cand.libraryId}`;
    return {
      shouldMerge: false,
      targetKey: modKey,
      confidence: "MODERATE",
      reason: `MERGE_CANDIDATE_MODERATE_IDENTITY: Brand name "${cleanName}" matches candidate entity "${targetEntity?.name}" but lacks strong corroborating Page ID, Page URL, or Domain evidence`,
      relationshipType: "UNRESOLVED_RELATIONSHIP"
    };
  }
  const baseKey = cand.facebookPageId && cand.facebookPageId.length > 4 ? `fb_${cand.facebookPageId}` : `name_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  const newKey = existingEntities.has(baseKey) ? `${baseKey}_${cand.libraryId}` : baseKey;
  return {
    shouldMerge: false,
    targetKey: newKey,
    confidence: pageNorm.pageId || pageNorm.pageSlug ? "STRONG" : domainNorm.canonicalDomain ? "MODERATE" : "WEAK",
    reason: "NEW_UNIQUE_ENTITY: Discovered new independent advertiser identity",
    relationshipType: "INDEPENDENT_BUSINESS"
  };
}
function mergeCandidateIntoEntity(target, cand, decision, sourceQuery) {
  target.activeAdCount = (target.activeAdCount || 0) + 1;
  target.adCount = (target.adCount || 0) + 1;
  if (!target.adLibraryIds.includes(cand.libraryId)) {
    target.adLibraryIds.push(cand.libraryId);
  }
  if (sourceQuery) {
    if (!target.matchedQueries) target.matchedQueries = [];
    if (!target.matchedQueries.includes(sourceQuery)) {
      target.matchedQueries.push(sourceQuery);
    }
    if (!target.matchedKeywords.includes(sourceQuery)) {
      target.matchedKeywords.push(sourceQuery);
    }
  }
  if (cand.observedKeyword) {
    if (!target.matchedKeywords.includes(cand.observedKeyword)) {
      target.matchedKeywords.push(cand.observedKeyword);
    }
  }
  const pageNorm = normalizeFacebookPage(cand.facebookPageUrl, cand.facebookPageId);
  if (!target.canonicalPageId && pageNorm.pageId) {
    target.canonicalPageId = pageNorm.pageId;
  }
  if (!target.canonicalPageSlug && pageNorm.pageSlug) {
    target.canonicalPageSlug = pageNorm.pageSlug;
  }
  if (!target.facebookPageUrl && pageNorm.canonicalUrl) {
    target.facebookPageUrl = pageNorm.canonicalUrl;
    target.facebookPageState = "found";
  }
  const domainNorm = normalizeDestinationDomain(cand.destinationUrl, cand.destinationDomain);
  if (!target.observedDomains) target.observedDomains = [];
  if (domainNorm.canonicalDomain && !target.observedDomains.includes(domainNorm.canonicalDomain)) {
    target.observedDomains.push(domainNorm.canonicalDomain);
  }
  if (!target.destinationDomain && domainNorm.canonicalDomain) {
    target.destinationDomain = domainNorm.canonicalDomain;
  }
  if (!target.destinationUrl && domainNorm.cleanUrl) {
    target.destinationUrl = domainNorm.cleanUrl;
    target.websiteState = "found";
  }
  if (!target.observedUrls) target.observedUrls = [];
  if (cand.destinationUrl && !target.observedUrls.includes(cand.destinationUrl)) {
    target.observedUrls.push(cand.destinationUrl);
  }
  const rawClean = normalizeAdvertiserName(cand.pageName);
  if (!target.aliases) target.aliases = [];
  if (rawClean && rawClean !== target.name && !target.aliases.includes(rawClean)) {
    target.aliases.push(rawClean);
  }
  if (!target.sampleCopy && cand.bodyCopy) {
    target.sampleCopy = cand.bodyCopy;
  }
  if (!target.sampleCta && cand.ctaText) {
    target.sampleCta = cand.ctaText;
  }
  if (!target.mergeHistory) target.mergeHistory = [];
  target.mergeHistory.push({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    mergeReason: decision.reason,
    sourceLibraryId: cand.libraryId,
    sourceQuery,
    confidence: decision.confidence
  });
}

// src/extension/creativeSignals.ts
var CTA_NORMALIZATION_MAP = {
  // Shop / Buy / Order
  "shop now": "SHOP_NOW",
  "shop now \u2192": "SHOP_NOW",
  "order now": "ORDER_NOW",
  "order now \u2192": "ORDER_NOW",
  "buy now": "BUY_NOW",
  "buy now \u2192": "BUY_NOW",
  "order": "ORDER_NOW",
  "shop": "SHOP_NOW",
  "buy": "BUY_NOW",
  // Learn / Information
  "learn more": "LEARN_MORE",
  "learn more \u2192": "LEARN_MORE",
  "see more": "LEARN_MORE",
  "view details": "LEARN_MORE",
  "explore": "LEARN_MORE",
  // Contact / Message / Call
  "contact us": "CONTACT_US",
  "contact us \u2192": "CONTACT_US",
  "send message": "SEND_MESSAGE",
  "send message \u2192": "SEND_MESSAGE",
  "message now": "SEND_MESSAGE",
  "call now": "CALL_NOW",
  "call now \u2192": "CALL_NOW",
  "whatsapp": "WHATSAPP_MESSAGE",
  "chat with us": "SEND_MESSAGE",
  // Booking / Appointments
  "book now": "BOOK_NOW",
  "book now \u2192": "BOOK_NOW",
  "book appointment": "APPOINTMENT_BOOKING",
  "book your appointment": "APPOINTMENT_BOOKING",
  "schedule now": "APPOINTMENT_BOOKING",
  "get quote": "GET_QUOTE",
  "request quote": "GET_QUOTE",
  // Sign up / Registration
  "sign up": "SIGN_UP",
  "sign up \u2192": "SIGN_UP",
  "register now": "SIGN_UP",
  "subscribe": "SUBSCRIBE",
  "apply now": "APPLY_NOW",
  // Offers
  "get offer": "GET_OFFER",
  "claim offer": "GET_OFFER",
  "grab offer": "GET_OFFER"
};
var DISCOUNT_PATTERNS = [
  /(\d{1,2}%\s*(?:off|discount|ছাড়|ছাড়))/i,
  /(?:flat|up\s*to)\s*(\d{1,2}%\s*(?:off|discount|ছাড়|ছাড়)?)/i,
  /(?:save|discount)\s*(?:up\s*to\s*)?(\d{1,2}%)/i,
  /\b(?:mega\s*sale|summer\s*sale|winter\s*sale|eid\s*sale|flash\s*sale|clearance\s*sale)\b/i,
  /\b(?:special\s*discount|exclusive\s*discount|festive\s*offer|special\s*offer)\b/i
];
var FREE_SHIPPING_PATTERNS = [
  /\b(?:free\s*shipping|free\s*delivery|ফ্রি\s*ডেলিভারি)\b/i
];
var BOGO_PATTERNS = [
  /\b(?:buy\s*1\s*get\s*1|bogo|buy\s*one\s*get\s*one)\b/i
];
var PRICE_PATTERNS = [
  /(?:[$€£]\s*[0-9,]+(?:\.[0-9]{2})?)/,
  /(?:(?:tk|bdt|rs|inr|usd)\.?\s*[0-9,]+)/i,
  /(?:[0-9,]+\s*(?:tk|bdt|taka|টাকা|৳))/i,
  /(?:৳\s*[0-9,]+)/
];
var COMMERCIAL_INTENT_PATTERNS = [
  { regex: /\b(?:appointment|consultation|schedule\s*visit)\b/i, normalized: "APPOINTMENT_BOOKING" },
  { regex: /\b(?:showroom|outlet|store\s*location|visit\s*our\s*outlet)\b/i, normalized: "SHOWROOM_VISIT" },
  { regex: /\b(?:cash\s*on\s*delivery|cod|ক্যাশ\s*অন\s*ডেলিভারি)\b/i, normalized: "CASH_ON_DELIVERY" },
  { regex: /\b(?:inbox\s*to\s*order|order\s*online|ইনবক্স\s*করুন)\b/i, normalized: "ORDER_INQUIRY" },
  { regex: /\b(?:warranty|guarantee|ওয়ারেন্টি|গ্যারান্টি)\b/i, normalized: "WARRANTY" },
  { regex: /\b(?:wholesale|retail|পাইকারি|খুচরা)\b/i, normalized: "COMMERCIAL_SCALE" }
];
var PRODUCT_TERM_PATTERNS = [
  { regex: /\b(sofa|couch|divan|sectional)\b/i, normalized: "sofa" },
  { regex: /\b(dining\s*table|dining\s*set)\b/i, normalized: "dining table" },
  { regex: /\b(bed|mattress|bedframe|headboard)\b/i, normalized: "bed" },
  { regex: /\b(chair|armchair|recliner|stool)\b/i, normalized: "chair" },
  { regex: /\b(wardrobe|closet|almirah)\b/i, normalized: "wardrobe" },
  { regex: /\b(desk|workstation|bookshelf|cabinet)\b/i, normalized: "cabinet" }
];
var SERVICE_TERM_PATTERNS = [
  { regex: /\b(interior\s*design|interior\s*decorating)\b/i, normalized: "interior design" },
  { regex: /\b(custom\s*made|custom\s*furniture|made\s*to\s*order)\b/i, normalized: "custom made" },
  { regex: /\b(free\s*delivery|home\s*delivery|express\s*shipping)\b/i, normalized: "delivery" },
  { regex: /\b(installation|assembly\s*service)\b/i, normalized: "installation" },
  { regex: /\b(warranty|guarantee)\b/i, normalized: "warranty" },
  { regex: /\b(consultation|architectural\s*consultation)\b/i, normalized: "consultation" }
];
function detectLanguage(text) {
  if (!text || text.trim().length === 0) {
    return { language: "UNKNOWN", confidence: "LOW" };
  }
  const bengaliChars = (text.match(/[\u0980-\u09FF]/g) || []).length;
  const latinChars = (text.match(/[A-Za-z]/g) || []).length;
  const totalLetters = bengaliChars + latinChars;
  if (totalLetters === 0) {
    return { language: "UNKNOWN", confidence: "LOW" };
  }
  const bengaliRatio = bengaliChars / totalLetters;
  const latinRatio = latinChars / totalLetters;
  if (bengaliRatio >= 0.7) {
    return { language: "BENGALI", rawLanguage: "bn", confidence: "HIGH" };
  }
  if (bengaliRatio >= 0.25 && latinRatio >= 0.25) {
    return { language: "MIXED", rawLanguage: "bn-en", confidence: "HIGH" };
  }
  const textLower = text.toLowerCase();
  const spanishMarkers = /\b(?:oferta|descuento|comprar|tienda|envío|más\s*información|precio|calidad)\b/i;
  const germanMarkers = /\b(?:rabatt|angebot|jetzt\s*kaufen|kostenloser\s*versand|mehr\s*erfahren|preis|qualität)\b/i;
  if (spanishMarkers.test(textLower) && !germanMarkers.test(textLower)) {
    return { language: "SPANISH", rawLanguage: "es", confidence: "HIGH" };
  }
  if (germanMarkers.test(textLower) && !spanishMarkers.test(textLower)) {
    return { language: "GERMAN", rawLanguage: "de", confidence: "HIGH" };
  }
  if (latinRatio >= 0.7) {
    return { language: "ENGLISH", rawLanguage: "en", confidence: "MEDIUM" };
  }
  return { language: "UNKNOWN", confidence: "LOW" };
}
function detectCreativeType(cand) {
  if (cand.videoUrl || cand.video || cand.cardType === "video" || cand.cardType === "VIDEO") {
    return "VIDEO";
  }
  if (cand.hasCarousel || cand.isCarousel || cand.cardType === "carousel" || cand.cardType === "CAROUSEL") {
    return "CAROUSEL";
  }
  if (cand.imageUrl || cand.image || cand.cardType === "image" || cand.cardType === "IMAGE") {
    return "IMAGE";
  }
  const combined = `${cand.rawText || ""} ${cand.bodyCopy || ""}`.toLowerCase();
  if (cand.hasMultipleVersions || combined.includes("carousel") || combined.includes("scroll to see more")) {
    return "CAROUSEL";
  }
  if (combined.includes("watch video") || combined.includes("video duration") || combined.includes("view video") || combined.includes("reel") || combined.includes("video")) {
    return "VIDEO";
  }
  if (combined.includes("photo") || combined.includes("image") || combined.includes("view photo")) {
    return "IMAGE";
  }
  return "UNKNOWN";
}
function extractCreativeSignalsFromCandidate(cand) {
  const rawSignals = [];
  if (cand.ctaText && cand.ctaText.trim()) {
    const rawCta = cand.ctaText.trim();
    const ctaNorm = CTA_NORMALIZATION_MAP[rawCta.toLowerCase()] || rawCta.toUpperCase().replace(/\s+/g, "_");
    rawSignals.push({
      type: "CTA",
      raw: rawCta,
      normalized: ctaNorm
    });
  }
  const combinedCopy = `${cand.bodyCopy || ""} ${cand.rawText || ""}`;
  for (const pattern of DISCOUNT_PATTERNS) {
    const match = combinedCopy.match(pattern);
    if (match) {
      rawSignals.push({
        type: "OFFER",
        raw: match[0].trim(),
        normalized: "DISCOUNT_OFFER"
      });
      break;
    }
  }
  for (const pattern of FREE_SHIPPING_PATTERNS) {
    const match = combinedCopy.match(pattern);
    if (match) {
      rawSignals.push({
        type: "OFFER",
        raw: match[0].trim(),
        normalized: "FREE_SHIPPING"
      });
      break;
    }
  }
  for (const pattern of BOGO_PATTERNS) {
    const match = combinedCopy.match(pattern);
    if (match) {
      rawSignals.push({
        type: "OFFER",
        raw: match[0].trim(),
        normalized: "BOGO_OFFER"
      });
      break;
    }
  }
  for (const pattern of PRICE_PATTERNS) {
    const match = combinedCopy.match(pattern);
    if (match) {
      rawSignals.push({
        type: "PRICE",
        raw: match[0].trim(),
        normalized: "PRICE_PRESENT"
      });
      break;
    }
  }
  for (const item of COMMERCIAL_INTENT_PATTERNS) {
    const match = combinedCopy.match(item.regex);
    if (match) {
      rawSignals.push({
        type: "COMMERCIAL_INTENT",
        raw: match[0].trim(),
        normalized: item.normalized
      });
    }
  }
  for (const item of PRODUCT_TERM_PATTERNS) {
    const match = combinedCopy.match(item.regex);
    if (match) {
      rawSignals.push({
        type: "PRODUCT_TERM",
        raw: match[0].trim(),
        normalized: item.normalized
      });
    }
  }
  for (const item of SERVICE_TERM_PATTERNS) {
    const match = combinedCopy.match(item.regex);
    if (match) {
      rawSignals.push({
        type: "SERVICE_TERM",
        raw: match[0].trim(),
        normalized: item.normalized
      });
    }
  }
  const cType = detectCreativeType(cand);
  if (cType !== "UNKNOWN") {
    rawSignals.push({
      type: "CREATIVE_TYPE",
      raw: cType,
      normalized: cType
    });
  }
  const langResult = detectLanguage(combinedCopy);
  if (langResult.language !== "UNKNOWN") {
    rawSignals.push({
      type: "LANGUAGE",
      raw: langResult.language,
      normalized: langResult.language
    });
  }
  return aggregateCreativeSignals(
    rawSignals.map((s) => ({
      type: s.type,
      rawSignal: s.raw,
      normalized: s.normalized,
      occurrences: 1
    }))
  );
}
function aggregateCreativeSignals(existingOrAll, newSignals) {
  const combined = newSignals ? [...existingOrAll, ...newSignals] : existingOrAll;
  const map = /* @__PURE__ */ new Map();
  for (const s of combined) {
    const key = `${s.type}::${s.normalized}`;
    const existing = map.get(key);
    if (existing) {
      existing.occurrences += s.occurrences || 1;
    } else {
      map.set(key, {
        type: s.type,
        rawSignal: s.rawSignal,
        raw: s.rawSignal,
        normalized: s.normalized,
        occurrences: s.occurrences || 1
      });
    }
  }
  return Array.from(map.values());
}

// src/extension/uncertainQueue.ts
var UNCERTAIN_REASONS = {
  UNCERTAIN_KEYWORD_ONLY: "Keyword matched in ad text or query, but entity lacks verified business identity or category corroboration.",
  UNCERTAIN_AMBIGUOUS_ENTITY: "Advertiser name is generic, dictionary word, or ambiguous without corroborating domain or verified page.",
  UNCERTAIN_MISSING_IDENTITY: "Commercial activity observed, but entity lacks both Facebook Page verification and destination website domain.",
  UNCERTAIN_MISSING_CATEGORY_EVIDENCE: "Commercial intent present (e.g. CTA or discounts), but vertical category evidence (product catalog, services) is incomplete.",
  UNCERTAIN_CONFLICT_NOT_RESOLVED: "Candidate has mixed or conflicting signals that do not meet the threshold for a definitive hard contradiction.",
  UNCERTAIN_SHARED_MARKETPLACE: "Destination domain is a multi-vendor shared marketplace (e.g. daraz, amazon) and seller has no independent category corroboration.",
  UNCERTAIN_LIMITED_PUBLIC_EVIDENCE: "Ad card contains minimal visible public evidence (under 20 characters of copy, no active CTA, no landing page)."
};
var SHARED_MARKETPLACES = /* @__PURE__ */ new Set([
  "daraz.com.bd",
  "daraz.com",
  "amazon.com",
  "aliexpress.com",
  "bikroy.com",
  "etsy.com",
  "ebay.com",
  "shopee.com",
  "lazada.com"
]);
function classifyUncertainCandidate(cand, v3Decision, intent, canonicalKey, existingRecord) {
  const adCopy = (cand.bodyCopy || cand.rawText || "").trim();
  const domain = (cand.destinationDomain || "").toLowerCase();
  const pageUrl = cand.facebookPageUrl || "";
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const missingEvidence = [];
  const reasonCodes = [];
  if (!pageUrl) {
    missingEvidence.push("FACEBOOK_PAGE_VERIFICATION");
  }
  if (!domain) {
    missingEvidence.push("DESTINATION_DOMAIN");
  }
  const hasCatalog = v3Decision.evidence.some((e) => e.type === "PRODUCT_OR_SERVICE_SIGNAL" && e.strength === "STRONG");
  if (!hasCatalog) {
    missingEvidence.push("CATEGORY_PRODUCT_CATALOG");
  }
  const hasCommercial = v3Decision.evidence.some((e) => e.type === "COMMERCIAL_INTENT");
  if (!hasCommercial) {
    missingEvidence.push("COMMERCIAL_INTENT_SIGNAL");
  }
  if (SHARED_MARKETPLACES.has(domain)) {
    reasonCodes.push("UNCERTAIN_SHARED_MARKETPLACE");
  }
  if (adCopy.length < 20 && !domain && !pageUrl) {
    reasonCodes.push("UNCERTAIN_LIMITED_PUBLIC_EVIDENCE");
  }
  if (!domain && !pageUrl) {
    reasonCodes.push("UNCERTAIN_MISSING_IDENTITY");
  }
  if (hasCommercial && !hasCatalog) {
    reasonCodes.push("UNCERTAIN_MISSING_CATEGORY_EVIDENCE");
  }
  const rawName = (cand.pageName || cand.advertiserName || cand.name || "").trim();
  const isGenericName = rawName.split(/\s+/).length <= 1 && !domain;
  if (isGenericName) {
    reasonCodes.push("UNCERTAIN_AMBIGUOUS_ENTITY");
  }
  if (v3Decision.reasonCode === "UNCERTAIN_KEYWORD_ONLY" || !hasCatalog && !domain && v3Decision.matchedTerms.length > 0) {
    reasonCodes.push("UNCERTAIN_KEYWORD_ONLY");
  }
  if (v3Decision.conflicts && v3Decision.conflicts.length > 0) {
    reasonCodes.push("UNCERTAIN_CONFLICT_NOT_RESOLVED");
  }
  if (reasonCodes.length === 0) {
    reasonCodes.push("UNCERTAIN_AMBIGUOUS_ENTITY");
  }
  const primaryReasonCode = reasonCodes[0];
  const matchedQueries = existingRecord?.matchedQueries ? [...existingRecord.matchedQueries] : [];
  const currentQuery = cand.observedKeyword || intent?.primaryKeywords?.[0];
  if (currentQuery && !matchedQueries.includes(currentQuery)) {
    matchedQueries.push(currentQuery);
  }
  const observedNames = existingRecord?.observedNames ? [...existingRecord.observedNames] : [];
  if (cand.pageName && !observedNames.includes(cand.pageName)) {
    observedNames.push(cand.pageName);
  }
  const observedAdIds = existingRecord?.observedAdIds ? [...existingRecord.observedAdIds] : [];
  if (cand.libraryId && !observedAdIds.includes(cand.libraryId)) {
    observedAdIds.push(cand.libraryId);
  }
  const observedDomains = existingRecord?.observedDomains ? [...existingRecord.observedDomains] : [];
  if (domain && !observedDomains.includes(domain)) {
    observedDomains.push(domain);
  }
  let identityConfidence = "WEAK";
  if (pageUrl && domain) {
    identityConfidence = "MODERATE";
  } else if (!pageUrl && !domain) {
    identityConfidence = "WEAK";
  } else if (isGenericName) {
    identityConfidence = "AMBIGUOUS";
  }
  const entityId = existingRecord?.entityId || `uncertain_${canonicalKey || rawName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
  return {
    entityId,
    entityKey: canonicalKey || rawName.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    canonicalName: rawName,
    observedNames,
    advertiserName: rawName,
    matchedQueries,
    identityConfidence,
    evidenceItems: v3Decision.evidence,
    missingEvidence,
    reasonCodes,
    primaryReasonCode,
    reasonCode: primaryReasonCode,
    reasons: [UNCERTAIN_REASONS[primaryReasonCode] || v3Decision.explanation],
    observedAdIds,
    observedDomains,
    facebookPageInfo: {
      pageName: cand.pageName,
      pageUrl: cand.facebookPageUrl,
      pageId: cand.facebookPageId
    },
    timestamps: {
      firstDiscovered: existingRecord?.timestamps?.firstDiscovered || now,
      lastEvaluated: now
    },
    recordedAt: now,
    lastEvaluationState: {
      score: v3Decision.score,
      decision: "UNCERTAIN",
      confidence: v3Decision.confidence,
      explanation: v3Decision.explanation
    },
    evidenceCoverage: v3Decision.evidenceCoverage
  };
}

// src/extension/advertiserExpander.ts
init_evidenceWaterfall();
var ADVERTISER_EXPANSION_BOUNDS = {
  MAX_ADVERTISER_EXPANSIONS_PER_RUN: 5,
  MAX_EXPANSIONS_PER_ENTITY: 1,
  MAX_ADS_PER_ADVERTISER_EXPANSION: 20,
  MAX_ADS_PER_EXPANSION: 20,
  MAX_EXPANSION_TIME_PER_ENTITY_MS: 15e3,
  // 15 seconds max per entity
  TIMEOUT_MS_PER_EXPANSION: 15e3
};
var GENERIC_NAME_BLOCKLIST = /* @__PURE__ */ new Set([
  "unknown advertiser",
  "sponsored",
  "facebook user",
  "advertiser",
  "daraz",
  "amazon",
  "shop",
  "store",
  "outlet",
  "online shop"
]);
function checkAdvertiserExpansionEligibility(entity, alreadyExpandedEntityIds = /* @__PURE__ */ new Set(), currentExpansionsCount) {
  const expandedSet = /* @__PURE__ */ new Set();
  let count = currentExpansionsCount ?? 0;
  if (Array.isArray(alreadyExpandedEntityIds)) {
    count = currentExpansionsCount ?? alreadyExpandedEntityIds.length;
    for (const item of alreadyExpandedEntityIds) {
      if (typeof item === "string") expandedSet.add(item);
      else if (item && typeof item === "object" && item.sourceEntityId) expandedSet.add(item.sourceEntityId);
    }
  } else if (alreadyExpandedEntityIds instanceof Set) {
    for (const id of alreadyExpandedEntityIds) expandedSet.add(id);
  }
  if (count >= ADVERTISER_EXPANSION_BOUNDS.MAX_ADVERTISER_EXPANSIONS_PER_RUN) {
    return {
      eligible: false,
      status: "RUN_EXPANSION_CAP_REACHED",
      reason: `Max advertiser expansions per run reached (${ADVERTISER_EXPANSION_BOUNDS.MAX_ADVERTISER_EXPANSIONS_PER_RUN})`
    };
  }
  if (entity.relevanceDecision === "UNCERTAIN") {
    return {
      eligible: false,
      status: "INELIGIBLE_UNCERTAIN",
      reason: "Entity relevance is UNCERTAIN. Review queue candidates are strictly ineligible for expansion."
    };
  }
  if (entity.relevanceDecision === "REJECTED" || entity.relevanceDecision === "NOT_RELEVANT") {
    return {
      eligible: false,
      status: "INELIGIBLE_REJECTED",
      reason: "Entity relevance is REJECTED/NOT_RELEVANT. Rejected candidates are strictly ineligible."
    };
  }
  if (entity.relevanceDecision !== "RELEVANT") {
    return {
      eligible: false,
      status: "NOT_ELIGIBLE",
      reason: `Relevance decision is ${entity.relevanceDecision || "UNKNOWN"}, not RELEVANT`
    };
  }
  if (entity.identityConfidence !== "STRONG") {
    return {
      eligible: false,
      status: "NOT_ELIGIBLE",
      reason: `Identity confidence is ${entity.identityConfidence || "UNKNOWN"}, requires STRONG`
    };
  }
  if (entity.advertiserExpansionStatus === "COMPLETED" || expandedSet.has(entity.id)) {
    return {
      eligible: false,
      status: "ALREADY_EXPANDED",
      reason: "Entity has already been expanded in this run"
    };
  }
  const name = (entity.canonicalName || entity.name || "").trim();
  if (name.length < 3) {
    return {
      eligible: false,
      status: "NOT_ELIGIBLE",
      reason: "Advertiser name is too short for public search"
    };
  }
  if (GENERIC_NAME_BLOCKLIST.has(name.toLowerCase())) {
    return {
      eligible: false,
      status: "NOT_ELIGIBLE",
      reason: "Advertiser name is generic or blocklisted"
    };
  }
  if (entity.relevanceEvidence && entity.relevanceEvidence.some((e) => e.type === "CONTRADICTION")) {
    return {
      eligible: false,
      status: "BLOCKED",
      reason: "Entity has unresolved contradiction evidence"
    };
  }
  return {
    eligible: true,
    status: "ELIGIBLE",
    reason: "Strong relevant advertiser eligible for bounded expansion"
  };
}

// src/extension/bulkProcessor.ts
function normalizeAdvertiserName2(rawName) {
  return normalizeAdvertiserName(rawName);
}
async function processBatch(candidates, existingEntitiesMap, seenAdLibraryIds, seenEntityKeys, currentCounters, options) {
  const {
    runId,
    countryCode,
    locationName,
    currentKeyword,
    intent,
    effectiveCeiling
  } = options;
  const processedAds = [];
  const updatedEntities = [];
  const uncertainEntities = [];
  const existingUncertainMap = options.existingUncertainMap || /* @__PURE__ */ new Map();
  const newEvidence = [];
  const newAdIdsAdded = [];
  const newEntityKeysAdded = [];
  const counters = {
    rawAds: currentCounters.rawAds,
    normalizedCandidates: currentCounters.normalizedCandidates,
    relevantCandidates: currentCounters.relevantCandidates,
    uncertainCandidates: currentCounters.uncertainCandidates,
    notRelevantCandidates: currentCounters.notRelevantCandidates,
    duplicatesRemoved: currentCounters.duplicatesRemoved,
    duplicateAdRecordsRemoved: currentCounters.duplicateAdRecordsRemoved ?? 0,
    entityMergesCount: currentCounters.entityMergesCount ?? 0,
    finalUniqueLeads: currentCounters.finalUniqueLeads,
    uniqueEntitiesObserved: currentCounters.uniqueEntitiesObserved ?? currentCounters.finalUniqueLeads,
    relevantEntities: currentCounters.relevantEntities ?? currentCounters.finalUniqueLeads,
    uncertainEntities: currentCounters.uncertainEntities ?? currentCounters.uncertainCandidates,
    notRelevantEntities: currentCounters.notRelevantEntities ?? currentCounters.notRelevantCandidates,
    keywordsCompleted: currentCounters.keywordsCompleted ?? 0,
    keywordsTotal: currentCounters.keywordsTotal ?? 1,
    finalUniqueRelevantLeads: currentCounters.finalUniqueRelevantLeads ?? currentCounters.finalUniqueLeads,
    reasonCodes: { ...currentCounters.reasonCodes || {} }
  };
  let safetyLimitReached = (counters.finalUniqueRelevantLeads || counters.finalUniqueLeads) >= effectiveCeiling;
  let newUniqueRelevantLeadsCount = 0;
  const entityIndex = options.entityIndex || new EntityResolutionIndex();
  for (const [key, lead] of existingEntitiesMap.entries()) {
    entityIndex.indexEntity(key, lead);
  }
  for (const cand of candidates) {
    if (seenAdLibraryIds.has(cand.libraryId)) {
      counters.duplicatesRemoved++;
      counters.duplicateAdRecordsRemoved = (counters.duplicateAdRecordsRemoved || 0) + 1;
      continue;
    }
    seenAdLibraryIds.add(cand.libraryId);
    newAdIdsAdded.push(cand.libraryId);
    counters.rawAds++;
    counters.normalizedCandidates++;
    processedAds.push(cand);
    const mergeDecision = evaluateEntityMerge(cand, existingEntitiesMap, entityIndex);
    if (mergeDecision.shouldMerge) {
      const existingEntity = existingEntitiesMap.get(mergeDecision.targetKey);
      if (existingEntity) {
        counters.duplicatesRemoved++;
        counters.entityMergesCount = (counters.entityMergesCount || 0) + 1;
        mergeCandidateIntoEntity(existingEntity, cand, mergeDecision, currentKeyword);
        const newSignals = extractCreativeSignalsFromCandidate(cand);
        existingEntity.creativeSignals = aggregateCreativeSignals([
          ...existingEntity.creativeSignals || [],
          ...newSignals
        ]);
        entityIndex.indexEntity(mergeDecision.targetKey, existingEntity);
        if (!updatedEntities.some((e) => e.id === existingEntity.id)) {
          updatedEntities.push(existingEntity);
        }
        continue;
      }
    }
    const entityKey = mergeDecision.targetKey;
    if (!seenEntityKeys.has(entityKey)) {
      counters.uniqueEntitiesObserved = (counters.uniqueEntitiesObserved || 0) + 1;
      seenEntityKeys.add(entityKey);
      newEntityKeysAdded.push(entityKey);
    }
    let evalResult = null;
    let v3Result = null;
    if (intent) {
      evalResult = LeadRelevanceEngine.evaluateCandidate(cand, intent);
      v3Result = evaluateStrictRelevanceV3({
        advertiserName: cand.pageName,
        adText: cand.bodyCopy,
        destinationUrl: cand.destinationUrl,
        destinationDomain: cand.destinationDomain,
        facebookPageUrl: cand.facebookPageUrl,
        ctaText: cand.ctaText,
        matchedKeyword: cand.observedKeyword || currentKeyword
      }, intent);
      if (v3Result.reasonCode) {
        counters.reasonCodes[v3Result.reasonCode] = (counters.reasonCodes[v3Result.reasonCode] || 0) + 1;
      }
      if (v3Result.decision === "NOT_RELEVANT") {
        counters.notRelevantCandidates++;
        counters.notRelevantEntities = (counters.notRelevantEntities || 0) + 1;
        continue;
      }
      if (v3Result.decision === "UNCERTAIN") {
        counters.uncertainCandidates++;
        counters.uncertainEntities = (counters.uncertainEntities || 0) + 1;
        const existingUnc = existingUncertainMap.get(entityKey);
        const uncRecord = classifyUncertainCandidate(cand, v3Result, intent, entityKey, existingUnc);
        existingUncertainMap.set(entityKey, uncRecord);
        uncertainEntities.push(uncRecord);
        continue;
      }
    }
    counters.relevantCandidates++;
    counters.relevantEntities = (counters.relevantEntities || 0) + 1;
    const currentLeadCount = counters.finalUniqueRelevantLeads || counters.finalUniqueLeads;
    if (currentLeadCount >= effectiveCeiling) {
      safetyLimitReached = true;
      break;
    }
    const cleanName = normalizeAdvertiserName2(cand.pageName);
    const pageNorm = normalizeFacebookPage(cand.facebookPageUrl, cand.facebookPageId);
    const domainNorm = normalizeDestinationDomain(cand.destinationUrl, cand.destinationDomain);
    const webState = domainNorm.cleanUrl || cand.destinationUrl ? "found" : "not_found";
    const fbState = pageNorm.canonicalUrl || cand.facebookPageUrl ? "found" : "not_found";
    const newLead = {
      id: `lead_${runId}_${entityKey}`,
      name: cleanName,
      canonicalName: cleanName,
      canonicalPageId: pageNorm.pageId,
      canonicalPageSlug: pageNorm.pageSlug,
      facebookPageName: cleanName,
      facebookPageUrl: pageNorm.canonicalUrl || cand.facebookPageUrl,
      facebookPageState: fbState,
      destinationUrl: domainNorm.cleanUrl || cand.destinationUrl,
      destinationDomain: domainNorm.canonicalDomain || cand.destinationDomain,
      observedDomains: domainNorm.canonicalDomain ? [domainNorm.canonicalDomain] : [],
      observedUrls: cand.destinationUrl ? [cand.destinationUrl] : [],
      aliases: [],
      websiteState: webState,
      adCount: 1,
      activeAdCount: 1,
      adLibraryIds: [cand.libraryId],
      adLibraryUrl: `https://www.facebook.com/ads/library/?id=${cand.libraryId}`,
      matchedKeywords: currentKeyword ? [currentKeyword] : intent?.primaryKeywords?.slice(0, 1) || [],
      matchedQueries: currentKeyword ? [currentKeyword] : intent?.primaryKeywords?.slice(0, 1) || [],
      locationCode: countryCode,
      locationName,
      status: webState === "found" ? "QUALIFIED" : "REVIEW_REQUIRED",
      discoveredAt: (/* @__PURE__ */ new Date()).toISOString(),
      sampleCopy: cand.bodyCopy,
      sampleCta: cand.ctaText,
      identityConfidence: mergeDecision.confidence,
      relationshipType: mergeDecision.relationshipType,
      mergeHistory: [],
      relevanceScore: v3Result?.score ?? evalResult?.score,
      relevanceDecision: v3Result?.decision ?? evalResult?.decision ?? "RELEVANT",
      relevanceConfidence: v3Result?.confidence ?? evalResult?.confidence,
      relevanceReasons: v3Result?.reasons ?? evalResult?.reasons,
      relevanceMatchedTerms: v3Result?.matchedTerms ?? evalResult?.matchedTerms,
      relevanceEvidence: v3Result?.evidence ?? evalResult?.evidence,
      relevanceStrategyVersion: v3Result?.strategyVersion ?? evalResult?.strategyVersion,
      engineVersion: v3Result?.engineVersion ?? evalResult?.engineVersion,
      presetVersion: v3Result?.presetVersion ?? evalResult?.presetVersion,
      evidenceCoverage: v3Result?.evidenceCoverage,
      evidenceExplanation: v3Result?.explanation,
      uniqueEvidenceSignals: v3Result?.uniqueEvidenceSignals,
      observedEvidenceOccurrences: v3Result?.observedEvidenceOccurrences,
      evaluationStatus: "RELEVANT",
      creativeSignals: extractCreativeSignalsFromCandidate(cand)
    };
    const expEligibility = checkAdvertiserExpansionEligibility(
      newLead,
      options.alreadyExpandedEntityIds || /* @__PURE__ */ new Set(),
      counters.advertiserExpansionsCount || 0
    );
    newLead.advertiserExpansionStatus = expEligibility.status === "ELIGIBLE" ? "PENDING" : "NOT_ELIGIBLE";
    existingEntitiesMap.set(entityKey, newLead);
    entityIndex.indexEntity(entityKey, newLead);
    updatedEntities.push(newLead);
    if (evalResult?.evidence) {
      newEvidence.push({
        canonicalKey: entityKey,
        evidence: evalResult.evidence
      });
    }
    counters.finalUniqueLeads++;
    counters.finalUniqueRelevantLeads = counters.finalUniqueLeads;
    newUniqueRelevantLeadsCount++;
    if (counters.finalUniqueLeads >= effectiveCeiling) {
      safetyLimitReached = true;
      break;
    }
  }
  Object.assign(currentCounters, counters);
  return {
    processedAds,
    updatedEntities,
    uncertainEntities,
    newEvidence,
    newAdIdsAdded,
    newEntityKeysAdded,
    counters,
    safetyLimitReached,
    newUniqueRelevantLeadsCount
  };
}

// src/extension/queryPlanner.ts
var MAX_QUERIES_PER_RESEARCH_RUN = 8;
var MAX_VARIANTS_PER_SEED = 5;
var MAX_QUERY_LENGTH = 60;
var CONTRADICTORY_QUERY_TOKENS = /* @__PURE__ */ new Set([
  "casino",
  "betting",
  "poker",
  "slots",
  "jackpot",
  "roulette",
  "senate",
  "parliament",
  "election",
  "ballot",
  "campaign rally",
  "fifa",
  "uefa",
  "premier league",
  "cricket board",
  "stadium match",
  "hospital clinic",
  "cancer remedy",
  "chronic disease",
  "prescription"
]);
var PLANNER_TAXONOMY = {
  furniture: {
    category: "furniture",
    aliases: ["furniture", "furnishing", "furnishings", "home decor", "woodcraft"],
    commercialTerms: [
      "Furniture Store",
      "Home Furniture",
      "Office Furniture",
      "Furniture Showroom"
    ],
    productTerms: [
      "Sofa",
      "Dining Table",
      "Office Chair",
      "Bedroom Furniture"
    ],
    serviceTerms: [
      "Custom Furniture"
    ],
    localeMappings: {
      BD: ["\u09AB\u09BE\u09B0\u09CD\u09A8\u09BF\u099A\u09BE\u09B0", "\u0986\u09B8\u09AC\u09BE\u09AC\u09AA\u09A4\u09CD\u09B0"],
      DE: ["M\xF6bel", "M\xF6belhaus"],
      ES: ["Muebles", "Tienda de muebles"]
    }
  },
  restaurant: {
    category: "restaurant",
    aliases: ["restaurant", "cafe", "bistro", "eatery", "dining", "food"],
    commercialTerms: [
      "Restaurant",
      "Bistro Cafe",
      "Fine Dining"
    ],
    productTerms: [
      "Food Delivery",
      "Catering Menu",
      "Lunch and Dinner"
    ],
    serviceTerms: [
      "Catering Services"
    ],
    localeMappings: {
      BD: ["\u09B0\u09C7\u09B8\u09CD\u09A4\u09CB\u09B0\u09BE\u0981", "\u0996\u09BE\u09AC\u09BE\u09B0"],
      DE: ["Gastronomie", "Speiselokal"],
      ES: ["Restaurante", "Cafeter\xEDa"]
    }
  },
  dental: {
    category: "dental",
    aliases: ["dentist", "dental", "orthodontist", "teeth"],
    commercialTerms: [
      "Dental Clinic",
      "Dental Practice",
      "Family Dentistry"
    ],
    productTerms: [
      "Teeth Whitening",
      "Dental Implants",
      "Invisalign"
    ],
    serviceTerms: [
      "Dental Care"
    ],
    localeMappings: {
      BD: ["\u09A1\u09C7\u09A8\u09CD\u099F\u09BE\u09B2 \u0995\u09CD\u09B2\u09BF\u09A8\u09BF\u0995", "\u09A6\u09BE\u0981\u09A4\u09C7\u09B0 \u09A1\u09BE\u0995\u09CD\u09A4\u09BE\u09B0"],
      DE: ["Zahnarztpraxis", "Zahnklinik"],
      ES: ["Cl\xEDnica Dental", "Odontolog\xEDa"]
    }
  },
  roofing: {
    category: "roofing",
    aliases: ["roof", "roofing", "roofer"],
    commercialTerms: [
      "Roofing Contractor",
      "Roofing Company",
      "Roof Replacement"
    ],
    productTerms: [
      "Metal Roof",
      "Roof Shingles"
    ],
    serviceTerms: [
      "Roof Repair",
      "Roof Inspection"
    ],
    localeMappings: {
      DE: ["Dachdecker", "Dachdeckerei"],
      ES: ["Tejados", "Cubiertas"]
    }
  },
  real_estate: {
    category: "real_estate",
    aliases: ["real estate", "realty", "realtor", "property", "properties"],
    commercialTerms: [
      "Real Estate Agency",
      "Property Broker",
      "Realty Group"
    ],
    productTerms: [
      "Apartments For Sale",
      "Commercial Property",
      "Homes For Sale"
    ],
    serviceTerms: [
      "Property Management"
    ],
    localeMappings: {
      DE: ["Immobilien", "Immobilienmakler"],
      ES: ["Inmobiliaria", "Bienes Ra\xEDces"]
    }
  },
  clothing: {
    category: "clothing",
    aliases: ["clothing", "apparel", "fashion", "garments", "wear"],
    commercialTerms: [
      "Clothing Store",
      "Fashion Boutique",
      "Apparel Brand"
    ],
    productTerms: [
      "Dresses",
      "Men Suits",
      "Casual Wear"
    ],
    serviceTerms: [
      "Custom Tailoring"
    ],
    localeMappings: {
      BD: ["\u09AA\u09CB\u09B6\u09BE\u0995", "\u09AC\u09C1\u099F\u09BF\u0995"],
      DE: ["Bekleidungsgesch\xE4ft", "Modegesch\xE4ft"],
      ES: ["Tienda de Ropa", "Moda"]
    }
  },
  fitness: {
    category: "fitness",
    aliases: ["fitness", "gym", "workout", "training"],
    commercialTerms: [
      "Fitness Center",
      "Gym Club",
      "Health Club"
    ],
    productTerms: [
      "Gym Membership",
      "Personal Training"
    ],
    serviceTerms: [
      "Fitness Coaching"
    ],
    localeMappings: {
      DE: ["Fitnessstudio", "Sportstudio"],
      ES: ["Gimnasio", "Centro de Fitness"]
    }
  },
  saas: {
    category: "saas",
    aliases: ["saas", "software", "cloud software", "b2b software"],
    commercialTerms: [
      "B2B SaaS Platform",
      "Cloud Software Solutions",
      "Enterprise Software"
    ],
    productTerms: [
      "CRM Platform",
      "Workflow Automation",
      "Analytics Software"
    ],
    serviceTerms: [
      "Software Subscription"
    ],
    localeMappings: {}
  },
  hvac: {
    category: "hvac",
    aliases: ["hvac", "air conditioning", "heating", "cooling", "ac repair"],
    commercialTerms: [
      "HVAC Contractor",
      "Heating and Cooling",
      "AC Installation"
    ],
    productTerms: [
      "Heat Pump",
      "Air Conditioner"
    ],
    serviceTerms: [
      "AC Repair",
      "HVAC Maintenance"
    ],
    localeMappings: {
      ES: ["Aire Acondicionado", "Climatizaci\xF3n"]
    }
  }
};
function normalizeQueryString(q) {
  if (!q) return "";
  return q.trim().replace(/\s+/g, " ");
}
function validateQueryQuality(candidate, seed, existingQueries) {
  const norm = normalizeQueryString(candidate);
  if (!norm || norm.length < 2) {
    return { valid: false, reason: "Query is empty or shorter than 2 characters." };
  }
  if (norm.length > MAX_QUERY_LENGTH) {
    return { valid: false, reason: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters.` };
  }
  const lowerCandidate = norm.toLowerCase();
  const lowerSeed = normalizeQueryString(seed).toLowerCase();
  if (existingQueries.has(lowerCandidate)) {
    return { valid: false, reason: "Query is a duplicate of an existing query." };
  }
  if (lowerCandidate === lowerSeed) {
    return { valid: false, reason: "Query is identical to seed query." };
  }
  for (const token of CONTRADICTORY_QUERY_TOKENS) {
    if (lowerCandidate.includes(token)) {
      return { valid: false, reason: `Query contains contradictory industry token: "${token}".` };
    }
  }
  if (!/[\p{L}\p{N}]/u.test(norm)) {
    return { valid: false, reason: "Query contains no alphanumeric characters." };
  }
  return { valid: true };
}
function matchCategoryTaxonomy(keyword) {
  const lower = keyword.toLowerCase().trim();
  for (const key of Object.keys(PLANNER_TAXONOMY)) {
    const entry = PLANNER_TAXONOMY[key];
    if (lower === entry.category || entry.aliases.some((alias) => lower.includes(alias) || alias.includes(lower))) {
      return entry;
    }
  }
  return null;
}
function planResearchQueries(options) {
  const {
    seedKeywords,
    countryCode = "US",
    locale = "",
    runId,
    maxQueries = MAX_QUERIES_PER_RESEARCH_RUN,
    maxVariantsPerSeed = MAX_VARIANTS_PER_SEED
  } = options;
  const validSeeds = seedKeywords.map(normalizeQueryString).filter((k) => k.length >= 2);
  if (validSeeds.length === 0) {
    return [];
  }
  const planned = [];
  const existingSet = /* @__PURE__ */ new Set();
  let sequenceCounter = 0;
  for (const seed of validSeeds) {
    if (planned.length >= maxQueries) break;
    const lowerSeed = seed.toLowerCase();
    if (!existingSet.has(lowerSeed)) {
      existingSet.add(lowerSeed);
      planned.push({
        query: seed,
        seedQuery: seed,
        variantType: "SEED",
        rationale: "Original user-entered seed query (primary discovery anchor)",
        locale,
        country: countryCode,
        sequence: sequenceCounter++,
        runId,
        status: "PENDING"
      });
    }
  }
  for (const seed of validSeeds) {
    if (planned.length >= maxQueries) break;
    let seedVariantCount = 0;
    const taxonomy = matchCategoryTaxonomy(seed);
    const candidatePool = [];
    if (taxonomy) {
      for (const term of taxonomy.commercialTerms.slice(0, 2)) {
        candidatePool.push({
          query: term,
          type: "COMMERCIAL_CATEGORY",
          rationale: `Commercial category expansion for ${taxonomy.category}`
        });
      }
      for (const term of taxonomy.productTerms.slice(0, 2)) {
        candidatePool.push({
          query: term,
          type: "PRODUCT_TERM",
          rationale: `High-intent product keyword for ${taxonomy.category}`
        });
      }
      const countryUpper = countryCode.toUpperCase();
      const localeTerms = taxonomy.localeMappings[countryUpper] || [];
      for (const term of localeTerms.slice(0, 2)) {
        candidatePool.push({
          query: term,
          type: "LOCALE_VARIANT",
          rationale: `Controlled locale variant for country ${countryUpper}`
        });
      }
      for (const term of taxonomy.serviceTerms.slice(0, 1)) {
        candidatePool.push({
          query: term,
          type: "SERVICE_TERM",
          rationale: `Service offering term for ${taxonomy.category}`
        });
      }
      for (const term of taxonomy.commercialTerms.slice(2)) {
        candidatePool.push({
          query: term,
          type: "COMMERCIAL_CATEGORY",
          rationale: `Additional commercial category expansion for ${taxonomy.category}`
        });
      }
      for (const term of taxonomy.productTerms.slice(2)) {
        candidatePool.push({
          query: term,
          type: "PRODUCT_TERM",
          rationale: `Additional product keyword for ${taxonomy.category}`
        });
      }
    } else {
      const lowerSeed = seed.toLowerCase();
      if (!lowerSeed.includes("store") && !lowerSeed.includes("shop") && !lowerSeed.includes("company")) {
        candidatePool.push({
          query: `${seed} Store`,
          type: "COMMERCIAL_CATEGORY",
          rationale: `Commercial category derivation for ${seed}`
        });
        candidatePool.push({
          query: `${seed} Company`,
          type: "COMMERCIAL_CATEGORY",
          rationale: `Commercial provider derivation for ${seed}`
        });
      }
      if (lowerSeed.endsWith("s") && !lowerSeed.endsWith("ss") && lowerSeed.length > 3) {
        candidatePool.push({
          query: seed.substring(0, seed.length - 1),
          type: "SINGULAR_PLURAL",
          rationale: `Singular form derivation for ${seed}`
        });
      } else if (!lowerSeed.endsWith("s")) {
        candidatePool.push({
          query: `${seed}s`,
          type: "SINGULAR_PLURAL",
          rationale: `Plural form derivation for ${seed}`
        });
      }
    }
    for (const item of candidatePool) {
      if (planned.length >= maxQueries) break;
      if (seedVariantCount >= maxVariantsPerSeed) break;
      const qualityCheck = validateQueryQuality(item.query, seed, existingSet);
      if (qualityCheck.valid) {
        existingSet.add(item.query.toLowerCase());
        planned.push({
          query: item.query,
          seedQuery: seed,
          variantType: item.type,
          rationale: item.rationale,
          locale,
          country: countryCode,
          sequence: sequenceCounter++,
          runId,
          status: "PENDING"
        });
        seedVariantCount++;
      }
    }
  }
  return planned;
}
function calculateQueryYield(newUniqueEntities, normalizedAdsProcessed) {
  if (normalizedAdsProcessed <= 0) return 0;
  return Number((newUniqueEntities / normalizedAdsProcessed).toFixed(4));
}
var QueryFrontier = class _QueryFrontier {
  constructor(runId, initialQueries, completed = [], activeIdx = 0) {
    this.activeIndex = 0;
    this.completedQueries = [];
    this.consecutiveZeroYieldCount = 0;
    this.isSaturated = false;
    this.runId = runId;
    this.queries = [...initialQueries];
    this.completedQueries = [...completed];
    this.activeIndex = activeIdx;
  }
  /**
   * Returns current active query or null if frontier exhausted or saturated.
   */
  getActiveQuery() {
    if (this.isSaturated) return null;
    if (this.activeIndex >= this.queries.length) return null;
    return this.queries[this.activeIndex];
  }
  /**
   * Returns all planned queries in frontier.
   */
  getQueries() {
    return [...this.queries];
  }
  /**
   * Records execution metrics for completed query and checks saturation.
   */
  recordQueryMetrics(queryIndex, metrics) {
    if (queryIndex < 0 || queryIndex >= this.queries.length) return;
    const q = this.queries[queryIndex];
    q.rawAds = metrics.rawAds;
    q.normalizedAds = metrics.normalizedAds;
    q.newUniqueEntities = metrics.newUniqueEntities;
    q.duplicateEntities = metrics.duplicateEntities;
    q.rejectedByRelevance = metrics.rejectedByRelevance;
    q.uncertainByRelevance = metrics.uncertainByRelevance;
    q.yield = calculateQueryYield(metrics.newUniqueEntities, metrics.normalizedAds);
    q.status = "COMPLETED";
    if (!this.completedQueries.includes(q.query)) {
      this.completedQueries.push(q.query);
    }
    if (q.variantType !== "SEED") {
      if (metrics.newUniqueEntities === 0) {
        this.consecutiveZeroYieldCount++;
      } else {
        this.consecutiveZeroYieldCount = 0;
      }
    }
    if (this.consecutiveZeroYieldCount >= 2) {
      this.isSaturated = true;
      this.saturationReason = "DISCOVERY_SATURATED: Consecutive expansion queries produced zero new unique entities.";
    }
    this.activeIndex = queryIndex + 1;
  }
  /**
   * Advances active index to next query.
   */
  advance() {
    this.activeIndex++;
  }
  /**
   * Checks if discovery is saturated.
   */
  getSaturationState() {
    return {
      isSaturated: this.isSaturated,
      reason: this.saturationReason
    };
  }
  /**
   * Serializes frontier for persistence in chrome.storage.local / IndexedDB.
   */
  serialize() {
    return {
      runId: this.runId,
      activeQueryIndex: this.activeIndex,
      queries: this.queries,
      completedQueries: this.completedQueries,
      isSaturated: this.isSaturated,
      saturationReason: this.saturationReason,
      consecutiveZeroYieldCount: this.consecutiveZeroYieldCount
    };
  }
  /**
   * Restores QueryFrontier from serialized state.
   */
  static restore(state) {
    const frontier = new _QueryFrontier(
      state.runId,
      state.queries || [],
      state.completedQueries || [],
      state.activeQueryIndex || 0
    );
    frontier.isSaturated = !!state.isSaturated;
    frontier.saturationReason = state.saturationReason;
    frontier.consecutiveZeroYieldCount = state.consecutiveZeroYieldCount || 0;
    return frontier;
  }
};

// src/extension/websiteUrlNormalizer.ts
var TRACKING_PARAM_PREFIXES = [
  "utm_",
  "_hs",
  "mc_"
];
var TRACKING_PARAMS = /* @__PURE__ */ new Set([
  "fbclid",
  "gclid",
  "msclkid",
  "ref",
  "ref_src",
  "source",
  "campaign",
  "affiliate",
  "tracking_id",
  "trk"
]);
function normalizeWebsiteUrl(inputUrl) {
  const original = (inputUrl || "").trim();
  if (!original) {
    return {
      isValid: false,
      originalUrl: original,
      normalizedUrl: "",
      finalUrl: "",
      finalOrigin: "",
      finalHostname: "",
      isMetaRedirect: false,
      error: "EMPTY_URL"
    };
  }
  if (/^(javascript|data|blob|file|about|chrome|chrome-extension):/i.test(original)) {
    return {
      isValid: false,
      originalUrl: original,
      normalizedUrl: "",
      finalUrl: "",
      finalOrigin: "",
      finalHostname: "",
      isMetaRedirect: false,
      error: "UNSUPPORTED_SCHEME"
    };
  }
  let workingUrl = original;
  let isMetaRedirect = false;
  if (!/^https?:\/\//i.test(workingUrl)) {
    workingUrl = "https://" + workingUrl;
  }
  try {
    let parsed = new URL(workingUrl);
    if (parsed.hostname.toLowerCase().includes("facebook.com") && (parsed.pathname.toLowerCase().endsWith("/l.php") || parsed.pathname.toLowerCase().endsWith("/l/"))) {
      const destinationParam = parsed.searchParams.get("u");
      if (destinationParam) {
        try {
          const decoded = decodeURIComponent(destinationParam);
          if (/^https?:\/\//i.test(decoded)) {
            workingUrl = decoded;
            parsed = new URL(workingUrl);
            isMetaRedirect = true;
          }
        } catch {
        }
      }
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        isValid: false,
        originalUrl: original,
        normalizedUrl: "",
        finalUrl: "",
        finalOrigin: "",
        finalHostname: "",
        isMetaRedirect,
        error: "INVALID_PROTOCOL"
      };
    }
    let hostname = parsed.hostname.toLowerCase().trim();
    if (hostname.endsWith(".")) {
      hostname = hostname.slice(0, -1);
    }
    if (!hostname || !hostname.includes(".") || hostname.includes(" ")) {
      return {
        isValid: false,
        originalUrl: original,
        normalizedUrl: "",
        finalUrl: "",
        finalOrigin: "",
        finalHostname: "",
        isMetaRedirect,
        error: "INVALID_HOSTNAME"
      };
    }
    const cleanedSearchParams = new URLSearchParams();
    for (const [key, value] of parsed.searchParams.entries()) {
      const lowerKey = key.toLowerCase();
      const isTracking = TRACKING_PARAMS.has(lowerKey) || TRACKING_PARAM_PREFIXES.some((prefix) => lowerKey.startsWith(prefix));
      if (!isTracking) {
        cleanedSearchParams.append(key, value);
      }
    }
    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    if (!pathname) {
      pathname = "/";
    }
    const searchString = cleanedSearchParams.toString() ? `?${cleanedSearchParams.toString()}` : "";
    const finalUrl = `${parsed.protocol}//${hostname}${pathname}${searchString}`;
    const finalOrigin = `${parsed.protocol}//${hostname}`;
    const baseHost = hostname.startsWith("www.") ? hostname.slice(4) : hostname;
    const normalizedUrl = `https://${baseHost}${pathname === "/" ? "" : pathname}${searchString}`;
    return {
      isValid: true,
      originalUrl: original,
      normalizedUrl,
      finalUrl,
      finalOrigin,
      finalHostname: hostname,
      isMetaRedirect
    };
  } catch (err) {
    return {
      isValid: false,
      originalUrl: original,
      normalizedUrl: "",
      finalUrl: "",
      finalOrigin: "",
      finalHostname: "",
      isMetaRedirect: false,
      error: err.message || "MALFORMED_URL"
    };
  }
}
function isSameOriginUrl(targetUrl, baseOrigin) {
  try {
    const targetParsed = new URL(targetUrl);
    const baseParsed = new URL(baseOrigin);
    const targetHost = targetParsed.hostname.toLowerCase().replace(/^www\./, "");
    const baseHost = baseParsed.hostname.toLowerCase().replace(/^www\./, "");
    return targetHost === baseHost;
  } catch {
    return false;
  }
}

// src/extension/websiteCache.ts
var CACHE_TTL_MS = 24 * 60 * 60 * 1e3;
var memoryCache = /* @__PURE__ */ new Map();
function getDomainCacheKey(originOrDomain) {
  let cleaned = (originOrDomain || "").toLowerCase().trim();
  cleaned = cleaned.replace(/^https?:\/\//, "").replace(/^www\./, "");
  const slashIdx = cleaned.indexOf("/");
  if (slashIdx !== -1) {
    cleaned = cleaned.slice(0, slashIdx);
  }
  return cleaned;
}
async function getCachedWebsiteVerification(originOrDomain) {
  const key = getDomainCacheKey(originOrDomain);
  if (!key) return null;
  const now = Date.now();
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    try {
      const storageKey = `web_verify_cache_${key}`;
      const res = await chrome.storage.local.get([storageKey]);
      const entry = res[storageKey];
      if (entry && entry.expiresAt > now && entry.record) {
        return entry.record;
      }
    } catch {
    }
  }
  const memEntry = memoryCache.get(key);
  if (memEntry) {
    if (memEntry.expiresAt > now) {
      return memEntry.record;
    } else {
      memoryCache.delete(key);
    }
  }
  return null;
}
async function setCachedWebsiteVerification(originOrDomain, record) {
  const key = getDomainCacheKey(originOrDomain);
  if (!key) return;
  const now = Date.now();
  const entry = {
    key,
    record,
    cachedAt: now,
    expiresAt: now + CACHE_TTL_MS
  };
  memoryCache.set(key, entry);
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    try {
      const storageKey = `web_verify_cache_${key}`;
      await chrome.storage.local.set({ [storageKey]: entry });
    } catch {
    }
  }
}

// src/extension/websiteVerifier.ts
init_relevanceEngine();
var MAX_PAGES_PER_DOMAIN = 5;
var MAX_PAGE_TIMEOUT_MS = 1e4;
var MAX_DOMAIN_VERIFICATION_TIME_MS = 3e4;
var BANNED_LINK_HOST_PATTERNS = [
  "facebook.com",
  "fb.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "youtube.com",
  "pinterest.com",
  "tiktok.com",
  "google.com",
  "amazon.",
  "ebay.",
  "aliexpress.",
  "daraz.",
  "walmart.",
  "etsy.",
  "apple.com",
  "play.google.com",
  "schema.org"
];
var BANNED_LINK_PATH_PATTERNS = [
  "/login",
  "/signin",
  "/sign-in",
  "/register",
  "/signup",
  "/sign-up",
  "/auth",
  "/cart",
  "/checkout",
  "/my-account",
  "/account",
  "/wp-admin",
  "/user",
  "/password",
  "/reset",
  ".pdf",
  ".jpg",
  ".png",
  ".zip"
];
function cleanText(text) {
  return (text || "").normalize("NFC").replace(/\s+/g, " ").trim();
}
function extractPageSignalsFromHtml(html, pageUrl) {
  const normHtml = html || "";
  const result = {
    url: pageUrl,
    statusCode: 200,
    title: "",
    metaDescription: "",
    h1: [],
    h2: [],
    visibleText: "",
    logoAlt: [],
    sameOriginLinks: [],
    emails: [],
    phones: [],
    addressCandidates: [],
    isBlocked: false
  };
  const lowerHtml = normHtml.toLowerCase();
  const challengePatterns = [
    "just a moment...",
    "attention required! | cloudflare",
    "cf-chl-bypass",
    "verify you are human",
    "security check to access",
    "access denied",
    "error 403 forbidden",
    "datadome",
    "incapsula",
    "bot detection"
  ];
  for (const pat of challengePatterns) {
    if (lowerHtml.includes(pat)) {
      result.isBlocked = true;
      result.blockedReason = `Security challenge / access barrier detected: "${pat}"`;
      return result;
    }
  }
  if (typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(normHtml, "text/html");
      result.title = cleanText(doc.title || "");
      const metaDesc = doc.querySelector('meta[name="description" i]') || doc.querySelector('meta[property="og:description" i]');
      if (metaDesc) {
        result.metaDescription = cleanText(metaDesc.getAttribute("content") || "");
      }
      const canonical = doc.querySelector('link[rel="canonical" i]');
      if (canonical) {
        result.canonicalUrl = canonical.getAttribute("href") || void 0;
      }
      doc.querySelectorAll("h1").forEach((el) => {
        const t = cleanText(el.textContent || "");
        if (t && t.length < 150) result.h1.push(t);
      });
      doc.querySelectorAll("h2").forEach((el) => {
        const t = cleanText(el.textContent || "");
        if (t && t.length < 150) result.h2.push(t);
      });
      doc.querySelectorAll("img[alt]").forEach((el) => {
        const alt = cleanText(el.getAttribute("alt") || "");
        const idOrClass = `${el.id} ${el.className}`.toLowerCase();
        if (alt && (idOrClass.includes("logo") || alt.toLowerCase().includes("logo"))) {
          result.logoAlt.push(alt);
        }
      });
      doc.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
        try {
          const parsed = JSON.parse(el.textContent || "{}");
          const org = Array.isArray(parsed) ? parsed.find((i) => i["@type"] === "Organization" || i["@type"] === "LocalBusiness") : parsed;
          if (org && org.name && typeof org.name === "string") {
            result.organizationName = cleanText(org.name);
          }
        } catch {
        }
      });
      const currentOrigin = new URL(pageUrl).origin;
      doc.querySelectorAll("a[href]").forEach((el) => {
        const href = el.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
          return;
        }
        try {
          const absUrl = new URL(href, pageUrl).toString();
          const parsedAbs = new URL(absUrl);
          const lowerPath = parsedAbs.pathname.toLowerCase();
          if (BANNED_LINK_HOST_PATTERNS.some((p) => parsedAbs.hostname.toLowerCase().includes(p)) || BANNED_LINK_PATH_PATTERNS.some((p) => lowerPath.includes(p))) {
            return;
          }
          if (isSameOriginUrl(absUrl, currentOrigin)) {
            const cleanTarget = `${parsedAbs.protocol}//${parsedAbs.hostname}${parsedAbs.pathname}`.replace(/\/$/, "") || `${parsedAbs.protocol}//${parsedAbs.hostname}/`;
            if (!result.sameOriginLinks.includes(cleanTarget)) {
              result.sameOriginLinks.push(cleanTarget);
            }
          }
        } catch {
        }
      });
      const scripts = doc.querySelectorAll("script, style, noscript, svg");
      scripts.forEach((s) => s.remove());
      result.visibleText = cleanText(doc.body?.textContent || "");
    } catch {
    }
  }
  if (!result.title) {
    const titleMatch = normHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) result.title = cleanText(titleMatch[1]);
  }
  if (!result.metaDescription) {
    const metaMatch = normHtml.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)["']/i);
    if (metaMatch) result.metaDescription = cleanText(metaMatch[1]);
  }
  if (result.h1.length === 0) {
    const h1Matches = normHtml.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    for (const m of h1Matches) {
      const t = cleanText(m[1].replace(/<[^>]+>/g, ""));
      if (t && t.length < 150) result.h1.push(t);
    }
  }
  if (result.h2.length === 0) {
    const h2Matches = normHtml.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi);
    for (const m of h2Matches) {
      const t = cleanText(m[1].replace(/<[^>]+>/g, ""));
      if (t && t.length < 150) result.h2.push(t);
    }
  }
  if (!result.visibleText) {
    result.visibleText = cleanText(normHtml.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
  }
  if (!result.organizationName) {
    const jsonLdMatches = normHtml.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const m of jsonLdMatches) {
      try {
        const parsed = JSON.parse(m[1].trim());
        const org = Array.isArray(parsed) ? parsed.find((i) => i["@type"] === "Organization" || i["@type"] === "LocalBusiness") : parsed;
        if (org && org.name && typeof org.name === "string") {
          result.organizationName = cleanText(org.name);
          break;
        }
      } catch {
      }
    }
  }
  if (result.logoAlt.length === 0) {
    const imgMatches = normHtml.matchAll(/<img[^>]+alt=["']([^"']+)["'][^>]*>/gi);
    for (const m of imgMatches) {
      const alt = cleanText(m[1]);
      if (alt && alt.toLowerCase().includes("logo")) {
        result.logoAlt.push(alt);
      }
    }
  }
  if (result.sameOriginLinks.length === 0) {
    try {
      const currentOrigin = new URL(pageUrl).origin;
      const aMatches = normHtml.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi);
      for (const m of aMatches) {
        const href = m[1];
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
          continue;
        }
        try {
          const absUrl = new URL(href, pageUrl).toString();
          const parsedAbs = new URL(absUrl);
          const lowerPath = parsedAbs.pathname.toLowerCase();
          if (BANNED_LINK_HOST_PATTERNS.some((p) => parsedAbs.hostname.toLowerCase().includes(p)) || BANNED_LINK_PATH_PATTERNS.some((p) => lowerPath.includes(p))) {
            continue;
          }
          if (isSameOriginUrl(absUrl, currentOrigin)) {
            const cleanTarget = `${parsedAbs.protocol}//${parsedAbs.hostname}${parsedAbs.pathname}`.replace(/\/$/, "") || `${parsedAbs.protocol}//${parsedAbs.hostname}/`;
            if (!result.sameOriginLinks.includes(cleanTarget)) {
              result.sameOriginLinks.push(cleanTarget);
            }
          }
        } catch {
        }
      }
    } catch {
    }
  }
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const rawEmails = (result.visibleText + " " + normHtml).match(emailRegex) || [];
  const bannedEmailDomains = ["example.com", "domain.com", "email.com", "sentry.io", "wixpress.com"];
  for (const e of rawEmails) {
    const lower = e.toLowerCase().trim();
    if (!lower.endsWith(".png") && !lower.endsWith(".jpg") && !bannedEmailDomains.some((b) => lower.includes(b)) && !result.emails.includes(lower)) {
      result.emails.push(lower);
    }
  }
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}\b/g;
  const rawPhones = result.visibleText.match(phoneRegex) || [];
  for (const p of rawPhones) {
    const cleaned = p.trim();
    const digitCount = (cleaned.match(/\d/g) || []).length;
    if (digitCount >= 7 && digitCount <= 15 && !result.phones.includes(cleaned)) {
      result.phones.push(cleaned);
    }
  }
  return result;
}
function prioritizePagesToCrawl(rootUrl, candidateLinks) {
  const queue = [];
  const root = rootUrl;
  queue.push(root);
  const cleanRootKey = root.toLowerCase().replace(/\/$/, "");
  const priorityKeywords = [
    ["about", "story", "company", "who-we-are"],
    ["contact", "reach-us", "location", "get-in-touch"],
    ["product", "service", "shop", "collection", "catalog", "menu"],
    ["category", "pricing", "showroom"]
  ];
  for (const group of priorityKeywords) {
    for (const link of candidateLinks) {
      if (queue.length >= MAX_PAGES_PER_DOMAIN) break;
      const lower = link.toLowerCase();
      const cleanLinkKey = lower.replace(/\/$/, "");
      if (cleanLinkKey !== cleanRootKey && !queue.includes(link) && group.some((kw) => lower.includes(kw))) {
        queue.push(link);
      }
    }
  }
  for (const link of candidateLinks) {
    if (queue.length >= MAX_PAGES_PER_DOMAIN) break;
    const cleanLinkKey = link.toLowerCase().replace(/\/$/, "");
    if (cleanLinkKey !== cleanRootKey && !queue.includes(link)) {
      queue.push(link);
    }
  }
  return queue.slice(0, MAX_PAGES_PER_DOMAIN);
}
function evaluateBusinessIdentityMatch(lead, extractedIdentity) {
  const canonicalName = (lead.canonicalName || lead.name || "").toLowerCase().trim();
  const fbPageName = (lead.facebookPageName || "").toLowerCase().trim();
  const targetDomain = (lead.destinationDomain || "").toLowerCase().trim();
  const host = extractedIdentity.hostname.toLowerCase().replace(/^www\./, "");
  const extractedTokens = /* @__PURE__ */ new Set();
  const addTokens = (str) => {
    if (!str) return;
    for (const tok of tokenizeText(str)) {
      extractedTokens.add(tok);
    }
  };
  addTokens(extractedIdentity.title);
  addTokens(extractedIdentity.organizationName);
  extractedIdentity.logoAlt.forEach(addTokens);
  extractedIdentity.headings.forEach(addTokens);
  const cleanOrg = (extractedIdentity.organizationName || "").toLowerCase().trim();
  const cleanTitle = extractedIdentity.title.toLowerCase().trim();
  const isDirectDomainMatch = Boolean(targetDomain && (host === targetDomain || host.endsWith(`.${targetDomain}`)));
  const leadNameTokens = tokenizeText(canonicalName).filter((t) => t.length > 2);
  const matchedTokens = leadNameTokens.filter((t) => extractedTokens.has(t));
  const tokenOverlapRatio = leadNameTokens.length > 0 ? matchedTokens.length / leadNameTokens.length : 0;
  if (cleanOrg && (cleanOrg === canonicalName || cleanOrg.includes(canonicalName) || canonicalName.includes(cleanOrg)) || cleanTitle.includes(canonicalName) && isDirectDomainMatch || tokenOverlapRatio >= 0.8 && isDirectDomainMatch && leadNameTokens.length >= 2 || extractedIdentity.logoAlt.some((alt) => alt.toLowerCase().includes(canonicalName))) {
    return {
      level: "STRONG",
      reason: `Website explicit business identity matches canonical entity "${lead.canonicalName}" with confirmed domain corroboration.`,
      evidenceItems: [{
        type: "WEBSITE_IDENTITY",
        strength: "STRONG",
        source: "website_verification",
        reason: `Website branding matches entity name "${lead.canonicalName}" on domain ${host}`,
        value: cleanOrg || cleanTitle
      }]
    };
  }
  if (tokenOverlapRatio >= 0.6 && leadNameTokens.length >= 2 || isDirectDomainMatch && tokenOverlapRatio >= 0.4 || fbPageName && cleanTitle.includes(fbPageName)) {
    return {
      level: "MODERATE",
      reason: `Website displays substantial brand token overlap (${Math.round(tokenOverlapRatio * 100)}%) with entity "${lead.canonicalName}".`,
      evidenceItems: [{
        type: "WEBSITE_IDENTITY",
        strength: "MODERATE",
        source: "website_verification",
        reason: `Substantial brand token overlap on domain ${host}`,
        value: matchedTokens.join(" ")
      }]
    };
  }
  if (cleanOrg && leadNameTokens.length >= 2 && tokenOverlapRatio === 0 && (!isDirectDomainMatch || tokenizeText(cleanOrg).filter((t) => t.length > 2).length >= 2)) {
    return {
      level: "CONTRADICTORY",
      reason: `Website explicitly identifies as distinct company "${cleanOrg}", contradicting lead "${lead.canonicalName}".`,
      evidenceItems: [{
        type: "WEBSITE_IDENTITY",
        strength: "CONTRADICTORY",
        source: "website_verification",
        reason: `Distinct entity identity "${cleanOrg}" contradicts "${lead.canonicalName}"`,
        value: cleanOrg
      }]
    };
  }
  if (tokenOverlapRatio > 0 && tokenOverlapRatio < 0.6) {
    return {
      level: "WEAK",
      reason: `Weak token overlap only (${matchedTokens.join(", ")}). Insufficient for confirmed business identity.`,
      evidenceItems: [{
        type: "WEBSITE_IDENTITY",
        strength: "WEAK",
        source: "website_verification",
        reason: `Weak name token overlap on domain ${host}`,
        value: matchedTokens.join(" ")
      }]
    };
  }
  return {
    level: "UNKNOWN",
    reason: "Insufficient distinct business identity evidence found on public website pages.",
    evidenceItems: []
  };
}
function extractCommercialSignals(combinedText) {
  const lower = combinedText.toLowerCase();
  const signals = /* @__PURE__ */ new Set();
  const evidenceItems = [];
  const commercialMap = [
    { code: "WEBSITE_PRODUCT_SIGNAL", pattern: /\b(products?|catalog|collection|models?|items?|specs?|specifications?)\b/i, label: "Product catalog signals" },
    { code: "WEBSITE_SERVICE_SIGNAL", pattern: /\b(services?|solutions?|customization|consultation|repair|maintenance)\b/i, label: "Service offerings" },
    { code: "WEBSITE_PRICE_SIGNAL", pattern: /(\$|€|£|bdt|taka|price|pricing|starts at|cost|affordable|special deal|flat \d+%)/i, label: "Explicit pricing" },
    { code: "WEBSITE_ECOMMERCE_SIGNAL", pattern: /\b(add to cart|checkout|buy now|shop now|shopping cart|order online|buy online)\b/i, label: "E-commerce cart functionality" },
    { code: "WEBSITE_BOOKING_SIGNAL", pattern: /\b(book(?:ing|\s+(?:an?\s+)?appointment)?|appointment|schedule|reserve|reservation)\b/i, label: "Appointment / booking system" },
    { code: "WEBSITE_CONTACT_SIGNAL", pattern: /\b(contact(?:\s+(?:us|sales|support|team))?|get\s+(?:a\s+)?quote|request\s+(?:a\s+)?quote|inquire|inquiry|reach us)\b/i, label: "Sales inquiry / quote mechanism" },
    { code: "WEBSITE_LOCATION_SIGNAL", pattern: /\b(our locations?|store locator|find a store|headquarters|office address)\b/i, label: "Physical store / office locations" },
    { code: "WEBSITE_SHOWROOM_SIGNAL", pattern: /\b(showroom|experience center|visit our showroom|flagship store)\b/i, label: "Physical showroom" },
    { code: "WEBSITE_DELIVERY_SIGNAL", pattern: /\b(delivery|shipping|nationwide shipping|home delivery|dispatch|freight)\b/i, label: "Delivery / shipping service" },
    { code: "WEBSITE_WARRANTY_SIGNAL", pattern: /\b(warranty|guarantee|\d+\s*year warranty|money back)\b/i, label: "Product / service warranty" }
  ];
  for (const item of commercialMap) {
    if (item.pattern.test(lower)) {
      signals.add(item.code);
      evidenceItems.push({
        type: "WEBSITE_COMMERCIAL",
        strength: "STRONG",
        source: "website_verification",
        reason: item.label,
        matchedSignal: item.code,
        value: item.code
      });
    }
  }
  return {
    signals: Array.from(signals),
    evidenceItems
  };
}
function evaluateWebsiteCategoryMatch(lead, combinedText) {
  const lower = combinedText.toLowerCase();
  const matchedKeywords = (lead.matchedKeywords || []).map((k) => k.toLowerCase().trim()).filter(Boolean);
  let activeTaxonomyTerms = [];
  for (const [key, tax] of Object.entries(BOUNDED_TAXONOMY)) {
    if (matchedKeywords.some((kw) => kw.includes(key) || tax.rootTerms.some((rt) => kw.includes(rt)))) {
      activeTaxonomyTerms = activeTaxonomyTerms.concat(tax.rootTerms, tax.productServiceTerms);
    }
  }
  if (activeTaxonomyTerms.length === 0) {
    activeTaxonomyTerms = matchedKeywords;
  }
  const foundTerms = /* @__PURE__ */ new Set();
  for (const term of activeTaxonomyTerms) {
    if (lower.includes(term.toLowerCase())) {
      foundTerms.add(term);
    }
  }
  if (foundTerms.size >= 3) {
    return {
      level: "STRONG",
      evidenceItems: [{
        type: "WEBSITE_CATEGORY",
        strength: "STRONG",
        source: "website_verification",
        reason: `Strong category corroboration on website: ${Array.from(foundTerms).slice(0, 5).join(", ")}`,
        value: Array.from(foundTerms).join(", ")
      }]
    };
  }
  if (foundTerms.size >= 1) {
    return {
      level: "MODERATE",
      evidenceItems: [{
        type: "WEBSITE_CATEGORY",
        strength: "MODERATE",
        source: "website_verification",
        reason: `Category terms observed on website: ${Array.from(foundTerms).join(", ")}`,
        value: Array.from(foundTerms).join(", ")
      }]
    };
  }
  return {
    level: "WEAK",
    evidenceItems: [{
      type: "WEBSITE_CATEGORY",
      strength: "WEAK",
      source: "website_verification",
      reason: "No clear category terms observed on public website.",
      value: "NO_CATEGORY_TERMS"
    }]
  };
}
function detectWebsiteNegativeSignals(combinedText, statusCode, pagesVisited) {
  const lower = combinedText.toLowerCase();
  const signals = /* @__PURE__ */ new Set();
  const evidenceItems = [];
  if (/(\bbuy this domain\b|\bdomain is for sale\b|\binquire about this domain\b|\bparked free\b|\bdomain parking\b|\bnamesilo\b|\bsedo\b|\bhugedomains\b|\bdan\.com\b)/i.test(lower)) {
    signals.add("PARKED_DOMAIN");
    signals.add("DOMAIN_FOR_SALE");
    evidenceItems.push({
      type: "WEBSITE_NEGATIVE",
      strength: "CONTRADICTORY",
      source: "website_verification",
      reason: "Domain parking or domain-for-sale placeholder detected",
      matchedSignal: "PARKED_DOMAIN"
    });
  }
  if (pagesVisited <= 1 && (/(\bunder construction\b|\bcoming soon\b|\bwebsite coming soon\b|\bdefault web site page\b|\bindex of \/\b)/i.test(lower) || lower.length < 150)) {
    signals.add("EMPTY_SITE");
    evidenceItems.push({
      type: "WEBSITE_NEGATIVE",
      strength: "MODERATE",
      source: "website_verification",
      reason: "Empty or under-construction placeholder site detected",
      matchedSignal: "EMPTY_SITE"
    });
  }
  if (/(\bbusiness directory\b|\byellow pages\b|\blocal business listings\b|\bfind local businesses\b|\btop 10 businesses\b)/i.test(lower) && !/(\babout our company\b|\bour showroom\b|\bour factory\b)/i.test(lower)) {
    signals.add("GENERIC_DIRECTORY");
    evidenceItems.push({
      type: "WEBSITE_NEGATIVE",
      strength: "CONTRADICTORY",
      source: "website_verification",
      reason: "Generic directory or listing portal destination detected",
      matchedSignal: "GENERIC_DIRECTORY"
    });
  }
  if (/(\bjob vacancies\b|\bsearch jobs\b|\bpost a job\b|\bcareer portal\b|\bjob portal\b)/i.test(lower) && !/(\bproducts\b|\bservices\b|\bour shop\b)/i.test(lower)) {
    signals.add("JOB_PORTAL");
    evidenceItems.push({
      type: "WEBSITE_NEGATIVE",
      strength: "CONTRADICTORY",
      source: "website_verification",
      reason: "Job recruitment portal detected instead of direct commercial business",
      matchedSignal: "JOB_PORTAL"
    });
  }
  if (/(\bmy personal blog\b|\bpersonal diary\b|\blifestyle blog by\b|\bwritten by a blogger\b)/i.test(lower) && !/(\bshop\b|\bcart\b|\border\b|\bcompany\b|\bstore\b)/i.test(lower)) {
    signals.add("PERSONAL_BLOG");
    evidenceItems.push({
      type: "WEBSITE_NEGATIVE",
      strength: "CONTRADICTORY",
      source: "website_verification",
      reason: "Personal blog or lifestyle journal destination detected",
      matchedSignal: "PERSONAL_BLOG"
    });
  }
  if (/(\bbreaking news\b|\bdaily news\b|\bjournalism\b|\bop-ed\b|\bpress release\b|\bnews agency\b)/i.test(lower) && !/(\bour products\b|\bour shop\b|\badd to cart\b|\bpricing\b)/i.test(lower)) {
    signals.add("NEWS_ONLY");
    evidenceItems.push({
      type: "WEBSITE_NEGATIVE",
      strength: "CONTRADICTORY",
      source: "website_verification",
      reason: "News or media editorial publication detected instead of commercial business",
      matchedSignal: "NEWS_ONLY"
    });
  }
  if (/(\bgovernment portal\b|\bofficial government\b|\bmunicipal services\b|\bpublic voting\b|\bdepartment of public works\b|\bcity hall\b)/i.test(lower)) {
    signals.add("GENERIC_DIRECTORY");
    evidenceItems.push({
      type: "WEBSITE_NEGATIVE",
      strength: "CONTRADICTORY",
      source: "website_verification",
      reason: "Government or municipal administration portal detected instead of commercial business",
      matchedSignal: "GENERIC_DIRECTORY"
    });
  }
  if (statusCode >= 400) {
    signals.add("BROKEN_SITE");
    evidenceItems.push({
      type: "WEBSITE_NEGATIVE",
      strength: "CONTRADICTORY",
      source: "website_verification",
      reason: `HTTP error status ${statusCode} returned by destination`,
      matchedSignal: "BROKEN_SITE"
    });
  }
  return {
    signals: Array.from(signals),
    evidenceItems
  };
}
function determineFinalWebsiteStatus(reachable, isBlocked, identityLevel, commercialCount, negativeSignals) {
  if (isBlocked) {
    return "BLOCKED";
  }
  if (!reachable) {
    return "INVALID";
  }
  if (negativeSignals.includes("PARKED_DOMAIN") || negativeSignals.includes("DOMAIN_FOR_SALE") || negativeSignals.includes("GENERIC_DIRECTORY") || negativeSignals.includes("JOB_PORTAL") || negativeSignals.includes("PERSONAL_BLOG") || negativeSignals.includes("NEWS_ONLY")) {
    return "NOT_A_BUSINESS_SITE";
  }
  if (identityLevel === "CONTRADICTORY") {
    return "NOT_A_BUSINESS_SITE";
  }
  if (identityLevel === "STRONG" && commercialCount >= 1 || identityLevel === "MODERATE" && commercialCount >= 2) {
    return "VERIFIED_BUSINESS_WEBSITE";
  }
  if (commercialCount >= 2 || identityLevel === "MODERATE" && commercialCount >= 1 || identityLevel === "WEAK" && commercialCount >= 1) {
    return "LIKELY_BUSINESS_WEBSITE";
  }
  return "UNCERTAIN_WEBSITE";
}
async function verifyLeadWebsite(lead, customFetch) {
  const startTime = Date.now();
  const originalUrl = lead.destinationUrl || lead.observedUrls && lead.observedUrls[0] || "";
  if (!originalUrl) {
    return {
      leadId: lead.id,
      canonicalName: lead.canonicalName || lead.name,
      originalUrl: "",
      normalizedUrl: "",
      finalUrl: "",
      finalOrigin: "",
      hostname: "",
      status: "NO_WEBSITE",
      identityMatch: "UNKNOWN",
      categoryMatch: "UNKNOWN",
      commercialSignals: [],
      negativeSignals: [],
      evidence: [],
      pagesVisited: [],
      contactSignals: [],
      locationSignals: [],
      verifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
      durationMs: Date.now() - startTime
    };
  }
  const norm = normalizeWebsiteUrl(originalUrl);
  if (!norm.isValid) {
    return {
      leadId: lead.id,
      canonicalName: lead.canonicalName || lead.name,
      originalUrl,
      normalizedUrl: norm.normalizedUrl,
      finalUrl: norm.finalUrl,
      finalOrigin: norm.finalOrigin,
      hostname: norm.finalHostname,
      status: "INVALID",
      identityMatch: "UNKNOWN",
      categoryMatch: "UNKNOWN",
      commercialSignals: [],
      negativeSignals: ["BROKEN_SITE"],
      evidence: [],
      pagesVisited: [],
      contactSignals: [],
      locationSignals: [],
      verifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
      durationMs: Date.now() - startTime,
      errorCode: norm.error || "INVALID_URL"
    };
  }
  const cached = await getCachedWebsiteVerification(norm.finalHostname);
  if (cached) {
    return {
      ...cached,
      leadId: lead.id,
      canonicalName: lead.canonicalName || lead.name
    };
  }
  const destinationEvidence = [];
  if (lead.destinationDomain) {
    const metaHost = lead.destinationDomain.toLowerCase().replace(/^www\./, "");
    const siteHost = norm.finalHostname.toLowerCase().replace(/^www\./, "");
    if (metaHost === siteHost || siteHost.endsWith(`.${metaHost}`)) {
      destinationEvidence.push({
        type: "WEBSITE_DESTINATION",
        strength: "STRONG",
        source: "website_verification",
        reason: `Advertiser Meta destination matches verified site host: ${norm.finalHostname}`,
        matchedSignal: "DESTINATION_MATCH_STRONG",
        value: norm.finalHostname
      });
    } else {
      destinationEvidence.push({
        type: "WEBSITE_DESTINATION",
        strength: "MODERATE",
        source: "website_verification",
        reason: `Destination domain divergence: Meta ad pointed to ${metaHost}, website is ${siteHost}`,
        matchedSignal: "DESTINATION_DOMAIN_CONFLICT",
        value: `${metaHost} != ${siteHost}`
      });
    }
  }
  const defaultFetch = async (url, timeoutMs) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch(url, {
        method: "GET",
        headers: { "Accept": "text/html,application/xhtml+xml" },
        signal: controller.signal
      });
      clearTimeout(timeout);
      const text = await resp.text();
      return { status: resp.status, html: text };
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  };
  const fetcher = customFetch || defaultFetch;
  const pagesVisited = [];
  const allExtractedTexts = [];
  const allContactSignals = [];
  const allLocationSignals = /* @__PURE__ */ new Set();
  let primaryTitle = "";
  let primaryOrgName;
  const primaryLogoAlts = [];
  const primaryHeadings = [];
  let isBlocked = false;
  let blockedReason;
  let crawlError;
  let pagesToCrawl = [norm.finalUrl];
  try {
    while (pagesToCrawl.length > 0 && pagesVisited.length < MAX_PAGES_PER_DOMAIN) {
      if (Date.now() - startTime >= MAX_DOMAIN_VERIFICATION_TIME_MS) {
        break;
      }
      const currentUrl = pagesToCrawl.shift();
      if (pagesVisited.includes(currentUrl)) continue;
      pagesVisited.push(currentUrl);
      let pageRes;
      try {
        pageRes = await fetcher(currentUrl, MAX_PAGE_TIMEOUT_MS);
      } catch (err) {
        if (pagesVisited.length === 1) {
          crawlError = err.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR";
        }
        continue;
      }
      if (pageRes.status === 403 || pageRes.status === 429) {
        isBlocked = true;
        blockedReason = `HTTP ${pageRes.status} access denied`;
        break;
      }
      const extracted = extractPageSignalsFromHtml(pageRes.html, currentUrl);
      if (extracted.isBlocked) {
        isBlocked = true;
        blockedReason = extracted.blockedReason;
        break;
      }
      allExtractedTexts.push(`${extracted.title} ${extracted.metaDescription} ${extracted.visibleText}`);
      if (pagesVisited.length === 1) {
        primaryTitle = extracted.title;
        primaryOrgName = extracted.organizationName;
        primaryLogoAlts.push(...extracted.logoAlt);
        primaryHeadings.push(...extracted.h1, ...extracted.h2);
        const prioritized = prioritizePagesToCrawl(norm.finalUrl, extracted.sameOriginLinks);
        for (const p of prioritized) {
          const pKey = p.toLowerCase().replace(/\/$/, "");
          const alreadyVisited = pagesVisited.some((v) => v.toLowerCase().replace(/\/$/, "") === pKey);
          const alreadyQueued = pagesToCrawl.some((q) => q.toLowerCase().replace(/\/$/, "") === pKey);
          if (!alreadyVisited && !alreadyQueued) {
            pagesToCrawl.push(p);
          }
        }
      }
      for (const email of extracted.emails) {
        if (!allContactSignals.some((c) => c.value === email)) {
          allContactSignals.push({ type: "email", value: email });
        }
      }
      for (const phone of extracted.phones) {
        if (!allContactSignals.some((c) => c.value === phone)) {
          allContactSignals.push({ type: "phone", value: phone });
        }
      }
    }
  } catch (err) {
    crawlError = err.message || "PARSE_ERROR";
  }
  const combinedText = allExtractedTexts.join(" ");
  const reachable = pagesVisited.length > 0 && !crawlError;
  const identityMatch = evaluateBusinessIdentityMatch(lead, {
    title: primaryTitle,
    organizationName: primaryOrgName,
    logoAlt: primaryLogoAlts,
    headings: primaryHeadings,
    hostname: norm.finalHostname
  });
  const commercial = extractCommercialSignals(combinedText);
  const categoryMatch = evaluateWebsiteCategoryMatch(lead, combinedText);
  const negative = detectWebsiteNegativeSignals(combinedText, reachable ? 200 : 500, pagesVisited.length);
  const finalStatus = determineFinalWebsiteStatus(
    reachable,
    isBlocked,
    identityMatch.level,
    commercial.signals.length,
    negative.signals
  );
  const structuredEvidence = [
    ...destinationEvidence,
    ...identityMatch.evidenceItems,
    ...commercial.evidenceItems,
    ...categoryMatch.evidenceItems,
    ...negative.evidenceItems
  ];
  if (allContactSignals.length > 0) {
    structuredEvidence.push({
      type: "WEBSITE_CONTACT",
      strength: "STRONG",
      source: "website_verification",
      reason: `Discovered ${allContactSignals.length} public contact channel(s) on website`,
      value: allContactSignals.map((c) => `${c.type}:${c.value}`).slice(0, 3).join(", ")
    });
  }
  const record = {
    leadId: lead.id,
    canonicalName: lead.canonicalName || lead.name,
    originalUrl,
    normalizedUrl: norm.normalizedUrl,
    finalUrl: norm.finalUrl,
    finalOrigin: norm.finalOrigin,
    hostname: norm.finalHostname,
    status: finalStatus,
    identityMatch: identityMatch.level,
    categoryMatch: categoryMatch.level,
    commercialSignals: commercial.signals,
    negativeSignals: negative.signals,
    evidence: structuredEvidence,
    pagesVisited,
    contactSignals: allContactSignals,
    locationSignals: Array.from(allLocationSignals),
    verifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
    durationMs: Date.now() - startTime,
    blockedReason,
    errorCode: crawlError
  };
  if (finalStatus !== "INVALID" && finalStatus !== "BLOCKED") {
    await setCachedWebsiteVerification(norm.finalHostname, record);
  }
  return record;
}

// src/extension/qualification/qualificationProfile.ts
var VALID_CRITERION_TYPES = /* @__PURE__ */ new Set([
  "RELEVANCE",
  "WEBSITE_STATUS",
  "BUSINESS_IDENTITY",
  "HAS_BUSINESS_PHONE",
  "HAS_BUSINESS_EMAIL",
  "HAS_BUSINESS_ADDRESS",
  "HAS_CONTACT_FORM",
  "HAS_SOCIAL_PROFILE",
  "LOCATION_MATCH",
  "CATEGORY_MATCH",
  "NAME_MATCH",
  "NEGATIVE_EVIDENCE",
  "SOURCE_EVIDENCE_REQUIREMENT",
  "COMPLETENESS_THRESHOLD",
  "CUSTOM_FIELD",
  // Phase 23 Business Intelligence Additions:
  "VERIFIED_BUSINESS_WEBSITE",
  "PUBLISHED_SERVICES",
  "SERVICE_AREA_MATCH",
  "BUSINESS_HOURS_PRESENT",
  "DIGITAL_BOOKING_PRESENT",
  "DIGITAL_ECOMMERCE_PRESENT",
  "DIGITAL_CHAT_PRESENT",
  "DIGITAL_ANALYTICS_PRESENT",
  "DIGITAL_CMS_DETECTED",
  "PUBLIC_EMAIL_AVAILABLE",
  "ROLE_EMAIL_AVAILABLE",
  "PERSON_EMAIL_AVAILABLE",
  "PUBLIC_PHONE_AVAILABLE",
  "PERSON_PHONE_AVAILABLE",
  "PUBLIC_PERSON_AVAILABLE",
  "PERSON_WITH_TITLE_AVAILABLE",
  "CROSS_SOURCE_CORROBORATION",
  "CORROBORATED_PHONE",
  "CORROBORATED_IDENTITY",
  "META_AD_ACTIVE",
  "EVIDENCE_COVERAGE_THRESHOLD",
  "BUSINESS_COMPLETENESS_THRESHOLD",
  "TEMPORAL_FRESHNESS"
]);
var VALID_OPERATORS = /* @__PURE__ */ new Set([
  "EQUALS",
  "NOT_EQUALS",
  "IN",
  "NOT_IN",
  "CONTAINS",
  "NOT_CONTAINS",
  "MATCHES",
  "EXISTS",
  "NOT_EXISTS",
  "COUNT_AT_LEAST",
  "COUNT_AT_MOST",
  "THRESHOLD_AT_LEAST",
  "THRESHOLD_AT_MOST",
  "ANY",
  "ALL",
  "NONE"
]);
var BANNED_KEYS = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
function validateQualificationProfile(profile) {
  const errors = [];
  const warnings = [];
  if (!profile || typeof profile !== "object") {
    return { isValid: false, errors: ["Profile must be a non-null object"], warnings: [] };
  }
  for (const k of Object.keys(profile)) {
    if (BANNED_KEYS.has(k)) {
      errors.push(`Security violation: Prohibited object key '${k}' detected`);
    }
  }
  if (!profile.profileId || typeof profile.profileId !== "string" || !profile.profileId.trim()) {
    errors.push("Profile must have a valid non-empty string profileId");
  }
  if (!profile.version || typeof profile.version !== "string" || !profile.version.trim()) {
    errors.push("Profile must have a valid non-empty string version");
  }
  const validMissingPolicies = ["MISSING_IS_UNKNOWN", "MISSING_FAILS_REQUIRED", "MISSING_ALLOWED"];
  if (!profile.missingDataPolicy || !validMissingPolicies.includes(profile.missingDataPolicy)) {
    errors.push(`Invalid missingDataPolicy: must be one of ${validMissingPolicies.join(", ")}`);
  }
  const validUnknownPolicies = ["UNKNOWN_FAILS_MANDATORY", "UNKNOWN_YIELDS_UNCERTAIN", "UNKNOWN_ALLOWED"];
  if (!profile.unknownDataPolicy || !validUnknownPolicies.includes(profile.unknownDataPolicy)) {
    errors.push(`Invalid unknownDataPolicy: must be one of ${validUnknownPolicies.join(", ")}`);
  }
  const validConflictPolicies = ["STRICT_CONTRADICTION", "PERMISSIVE"];
  if (!profile.conflictPolicy || !validConflictPolicies.includes(profile.conflictPolicy)) {
    errors.push(`Invalid conflictPolicy: must be one of ${validConflictPolicies.join(", ")}`);
  }
  if (profile.thresholds) {
    if (typeof profile.thresholds !== "object") {
      errors.push("thresholds must be an object if specified");
    } else {
      const minScore = profile.thresholds.minimumScore;
      if (minScore !== void 0) {
        if (typeof minScore !== "number" || Number.isNaN(minScore) || !Number.isFinite(minScore) || minScore < 0) {
          errors.push("thresholds.minimumScore must be a non-negative finite number");
        }
      }
    }
  }
  if (!Array.isArray(profile.criteria)) {
    errors.push("Profile must contain an array of criteria");
    return { isValid: errors.length === 0, errors, warnings };
  }
  if (profile.criteria.length === 0) {
    warnings.push("Profile has 0 criteria; evaluation will trivially pass");
  }
  if (profile.criteria.length > 100) {
    errors.push("Resource limit exceeded: profile cannot contain more than 100 criteria");
  }
  const seenIds = /* @__PURE__ */ new Set();
  for (let idx = 0; idx < profile.criteria.length; idx++) {
    const c = profile.criteria[idx];
    const prefix = `Criterion[${idx}]`;
    if (!c || typeof c !== "object") {
      errors.push(`${prefix}: must be a non-null object`);
      continue;
    }
    for (const ck of Object.keys(c)) {
      if (BANNED_KEYS.has(ck)) {
        errors.push(`${prefix}: Security violation: Prohibited key '${ck}' detected`);
      }
    }
    if (!c.id || typeof c.id !== "string" || !c.id.trim()) {
      errors.push(`${prefix}: must have a non-empty string id`);
    } else {
      if (seenIds.has(c.id)) {
        errors.push(`${prefix}: duplicate criterion ID '${c.id}'`);
      }
      seenIds.add(c.id);
    }
    if (!c.type || !VALID_CRITERION_TYPES.has(c.type)) {
      errors.push(`${prefix}: invalid or unsupported criterion type '${c.type}'`);
    }
    if (!c.operator || !VALID_OPERATORS.has(c.operator)) {
      errors.push(`${prefix}: invalid or unsupported operator '${c.operator}'`);
    }
    if (typeof c.mandatory !== "boolean") {
      errors.push(`${prefix}: 'mandatory' must be a boolean`);
    }
    if (c.weight !== void 0) {
      if (typeof c.weight !== "number" || Number.isNaN(c.weight) || !Number.isFinite(c.weight) || c.weight < 0) {
        errors.push(`${prefix}: 'weight' must be a non-negative finite number`);
      }
    }
    if (c.operator === "COUNT_AT_LEAST" || c.operator === "COUNT_AT_MOST") {
      if (typeof c.expectedValue !== "number" || Number.isNaN(c.expectedValue) || c.expectedValue < 0) {
        errors.push(`${prefix}: operator '${c.operator}' requires a non-negative integer expectedValue`);
      }
    }
    if (c.operator === "MATCHES") {
      if (typeof c.expectedValue !== "string") {
        errors.push(`${prefix}: operator 'MATCHES' requires a string regex pattern`);
      } else {
        if (c.expectedValue.length > 200) {
          errors.push(`${prefix}: regex pattern exceeds safe maximum length (200 chars)`);
        } else {
          try {
            new RegExp(c.expectedValue);
          } catch (regErr) {
            errors.push(`${prefix}: invalid regular expression '${c.expectedValue}': ${regErr.message}`);
          }
        }
      }
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
var CANONICAL_DEFAULT_PROFILE = {
  profileId: "leadnoria_default_commercial_v1",
  profileName: "Standard Commercial Business Qualification",
  version: "1.0.0",
  enabled: true,
  missingDataPolicy: "MISSING_IS_UNKNOWN",
  unknownDataPolicy: "UNKNOWN_YIELDS_UNCERTAIN",
  conflictPolicy: "STRICT_CONTRADICTION",
  thresholds: {
    minimumScore: 60
  },
  criteria: [
    {
      id: "req_relevance",
      type: "RELEVANCE",
      operator: "EQUALS",
      expectedValue: "RELEVANT",
      mandatory: true,
      weight: 30,
      description: "Business must satisfy search relevance"
    },
    {
      id: "req_website_status",
      type: "WEBSITE_STATUS",
      operator: "IN",
      expectedValue: ["WEBSITE_VERIFIED_BUSINESS_SITE", "WEBSITE_PRESENT"],
      mandatory: true,
      weight: 25,
      description: "Business must possess an active or verified business website"
    },
    {
      id: "req_phone",
      type: "HAS_BUSINESS_PHONE",
      operator: "COUNT_AT_LEAST",
      expectedValue: 1,
      mandatory: true,
      weight: 25,
      description: "Business must have at least one usable public phone number"
    },
    {
      id: "opt_email",
      type: "HAS_BUSINESS_EMAIL",
      operator: "COUNT_AT_LEAST",
      expectedValue: 1,
      mandatory: false,
      weight: 20,
      description: "Bonus: Business possesses a public business email"
    }
  ]
};
var LOCAL_SERVICE_BUSINESS_PROFILE = {
  profileId: "leadnoria_local_service_v1",
  profileName: "Local Service Business Qualification",
  version: "1.0.0",
  enabled: true,
  missingDataPolicy: "MISSING_IS_UNKNOWN",
  unknownDataPolicy: "UNKNOWN_YIELDS_UNCERTAIN",
  conflictPolicy: "STRICT_CONTRADICTION",
  thresholds: {
    minimumScore: 60
  },
  criteria: [
    {
      id: "req_local_website",
      type: "VERIFIED_BUSINESS_WEBSITE",
      operator: "EXISTS",
      mandatory: true,
      weight: 25,
      description: "Business must possess a verified website"
    },
    {
      id: "req_local_contact",
      type: "PUBLIC_PHONE_AVAILABLE",
      operator: "EXISTS",
      mandatory: true,
      weight: 25,
      description: "Business must provide a public phone contact"
    },
    {
      id: "opt_local_services",
      type: "PUBLISHED_SERVICES",
      operator: "COUNT_AT_LEAST",
      expectedValue: 1,
      mandatory: false,
      weight: 20,
      description: "Business lists published local services"
    },
    {
      id: "opt_local_hours",
      type: "BUSINESS_HOURS_PRESENT",
      operator: "EXISTS",
      mandatory: false,
      weight: 15,
      description: "Business hours are publicly available"
    },
    {
      id: "opt_local_booking",
      type: "DIGITAL_BOOKING_PRESENT",
      operator: "EXISTS",
      mandatory: false,
      weight: 15,
      description: "Online booking capability detected"
    }
  ]
};
var B2B_PROSPECT_PROFILE = {
  profileId: "leadnoria_b2b_prospect_v1",
  profileName: "B2B Commercial Prospect Qualification",
  version: "1.0.0",
  enabled: true,
  missingDataPolicy: "MISSING_IS_UNKNOWN",
  unknownDataPolicy: "UNKNOWN_YIELDS_UNCERTAIN",
  conflictPolicy: "STRICT_CONTRADICTION",
  thresholds: {
    minimumScore: 65
  },
  criteria: [
    {
      id: "req_b2b_website",
      type: "VERIFIED_BUSINESS_WEBSITE",
      operator: "EXISTS",
      mandatory: true,
      weight: 25,
      description: "Verified business domain must exist"
    },
    {
      id: "req_b2b_email",
      type: "PUBLIC_EMAIL_AVAILABLE",
      operator: "EXISTS",
      mandatory: true,
      weight: 25,
      description: "Public business email must be available"
    },
    {
      id: "opt_b2b_services",
      type: "PUBLISHED_SERVICES",
      operator: "COUNT_AT_LEAST",
      expectedValue: 1,
      mandatory: false,
      weight: 20,
      description: "Business describes explicit service offerings"
    },
    {
      id: "opt_b2b_person",
      type: "PUBLIC_PERSON_AVAILABLE",
      operator: "EXISTS",
      mandatory: false,
      weight: 15,
      description: "Public team member or person identified"
    },
    {
      id: "opt_b2b_corroboration",
      type: "CORROBORATED_IDENTITY",
      operator: "EXISTS",
      mandatory: false,
      weight: 15,
      description: "Business identity corroborated across multiple sources"
    }
  ]
};
var DIGITAL_COMMERCE_BUSINESS_PROFILE = {
  profileId: "leadnoria_digital_commerce_v1",
  profileName: "Digital Commerce Business Qualification",
  version: "1.0.0",
  enabled: true,
  missingDataPolicy: "MISSING_IS_UNKNOWN",
  unknownDataPolicy: "UNKNOWN_YIELDS_UNCERTAIN",
  conflictPolicy: "STRICT_CONTRADICTION",
  thresholds: {
    minimumScore: 60
  },
  criteria: [
    {
      id: "req_ecom_website",
      type: "VERIFIED_BUSINESS_WEBSITE",
      operator: "EXISTS",
      mandatory: true,
      weight: 30,
      description: "Active website required"
    },
    {
      id: "req_ecom_capability",
      type: "DIGITAL_ECOMMERCE_PRESENT",
      operator: "EXISTS",
      mandatory: true,
      weight: 30,
      description: "E-commerce platform or checkout capability detected"
    },
    {
      id: "opt_ecom_chat",
      type: "DIGITAL_CHAT_PRESENT",
      operator: "EXISTS",
      mandatory: false,
      weight: 20,
      description: "Customer chat / widget present"
    },
    {
      id: "opt_ecom_analytics",
      type: "DIGITAL_ANALYTICS_PRESENT",
      operator: "EXISTS",
      mandatory: false,
      weight: 20,
      description: "Digital analytics technology detected"
    }
  ]
};
var HIGH_CONTACTABILITY_PROFILE = {
  profileId: "leadnoria_high_contactability_v1",
  profileName: "High Contactability Qualification",
  version: "1.0.0",
  enabled: true,
  missingDataPolicy: "MISSING_IS_UNKNOWN",
  unknownDataPolicy: "UNKNOWN_YIELDS_UNCERTAIN",
  conflictPolicy: "STRICT_CONTRADICTION",
  thresholds: {
    minimumScore: 70
  },
  criteria: [
    {
      id: "req_contact_email",
      type: "PUBLIC_EMAIL_AVAILABLE",
      operator: "EXISTS",
      mandatory: true,
      weight: 30,
      description: "Public business email must be available"
    },
    {
      id: "req_contact_phone",
      type: "PUBLIC_PHONE_AVAILABLE",
      operator: "EXISTS",
      mandatory: true,
      weight: 30,
      description: "Public business phone must be available"
    },
    {
      id: "opt_contact_form",
      type: "HAS_CONTACT_FORM",
      operator: "EXISTS",
      mandatory: false,
      weight: 20,
      description: "Contact form available on website"
    },
    {
      id: "opt_contact_corroborated_phone",
      type: "CORROBORATED_PHONE",
      operator: "EXISTS",
      mandatory: false,
      weight: 20,
      description: "Phone corroborated across distinct sources"
    }
  ]
};

// src/extension/qualification/qualificationFirewall.ts
function checkQualificationEligibility(contribution) {
  if (!contribution) {
    return { isBlocked: false, restrictionBasis: "NONE" };
  }
  if (contribution.policyStatus === "PRODUCT_REJECTED") {
    return {
      isBlocked: true,
      reason: `Field '${contribution.fieldName}' is PRODUCT_REJECTED by compliance policy`,
      restrictionBasis: contribution.restrictionBasis
    };
  }
  return {
    isBlocked: false,
    restrictionBasis: contribution.restrictionBasis
  };
}
function deriveCompositeRestrictions(context) {
  const allContributions = [
    ...context.sourceContributions || [],
    ...context.relevanceResult?.sourceContributions || [],
    ...context.mapsVerificationResult?.sourceContributions || [],
    ...context.contactEnrichment?.sourceContributions || [],
    ...context.businessIntelligence?.sourceContributions || []
  ];
  const seenContribKeys = /* @__PURE__ */ new Set();
  const dedupedContributions = [];
  for (const c of allContributions) {
    const key = `${c.fieldName}_${c.source}_${c.provenance}_${c.acquisitionContext}`;
    if (!seenContribKeys.has(key)) {
      seenContribKeys.add(key);
      dedupedContributions.push(c);
    }
  }
  const allDerivedFrom = /* @__PURE__ */ new Set([
    ...context.derivedFrom || [],
    ...context.relevanceResult?.derivedFrom || [],
    ...context.mapsVerificationResult?.derivedFrom || [],
    ...context.contactEnrichment?.derivedFrom || [],
    ...context.businessIntelligence?.derivedFrom || []
  ]);
  const hasRestrictedGoogle = context.businessIntelligence?.hasRestrictedGoogleEvidence === true || context.businessIntelligence?.sourceRestrictions?.isRestricted === true || dedupedContributions.some(
    (c) => c.provenance === "GOOGLE_DERIVED" || c.restrictionBasis === "GOOGLE_CONSUMER_WEB_RESTRICTED"
  );
  const hasRestrictedAPI = dedupedContributions.some(
    (c) => c.restrictionBasis === "GOOGLE_API_SERVICE_SPECIFIC"
  );
  let restrictionBasis = "NONE";
  let persistenceEligibility = "PERSISTABLE";
  let exportEligibility = "EXPORTABLE";
  let policyStatus = "POLICY_APPROVED";
  if (hasRestrictedGoogle) {
    restrictionBasis = "GOOGLE_CONSUMER_WEB_RESTRICTED";
    persistenceEligibility = "NOT_PERSISTABLE";
    exportEligibility = "NOT_EXPORTABLE";
  } else if (hasRestrictedAPI) {
    restrictionBasis = "GOOGLE_API_SERVICE_SPECIFIC";
    persistenceEligibility = "PERSISTENCE_GATED";
    exportEligibility = "EXPORT_GATED";
    policyStatus = "POLICY_REVIEW_REQUIRED";
  }
  const provenances = new Set(dedupedContributions.map((c) => c.provenance));
  let provenance = "LEADNORIA_DERIVED";
  if (provenances.size > 1) {
    provenance = "MIXED";
  } else if (provenances.size === 1) {
    provenance = Array.from(provenances)[0];
  } else if (context.contactEnrichment) {
    provenance = context.contactEnrichment.provenance;
  }
  return {
    isRestricted: hasRestrictedGoogle || hasRestrictedAPI,
    restrictionBasis,
    policyStatus,
    persistenceEligibility,
    exportEligibility,
    provenance,
    sourceContributions: dedupedContributions,
    derivedFrom: Array.from(allDerivedFrom).sort()
  };
}

// src/extension/qualification/criterionEvaluator.ts
function evaluateOperator(operator, actual, expected) {
  switch (operator) {
    case "EQUALS":
      return actual === expected || String(actual).toLowerCase() === String(expected).toLowerCase();
    case "NOT_EQUALS":
      return actual !== expected && String(actual).toLowerCase() !== String(expected).toLowerCase();
    case "IN":
      if (Array.isArray(expected)) {
        return expected.some((exp) => exp === actual || String(exp).toLowerCase() === String(actual).toLowerCase());
      }
      return false;
    case "NOT_IN":
      if (Array.isArray(expected)) {
        return !expected.some((exp) => exp === actual || String(exp).toLowerCase() === String(actual).toLowerCase());
      }
      return true;
    case "CONTAINS":
      if (typeof actual === "string" && typeof expected === "string") {
        return actual.toLowerCase().includes(expected.toLowerCase());
      }
      if (Array.isArray(actual)) {
        return actual.some((item) => item === expected || String(item).toLowerCase() === String(expected).toLowerCase());
      }
      return false;
    case "NOT_CONTAINS":
      if (typeof actual === "string" && typeof expected === "string") {
        return !actual.toLowerCase().includes(expected.toLowerCase());
      }
      if (Array.isArray(actual)) {
        return !actual.some((item) => item === expected || String(item).toLowerCase() === String(expected).toLowerCase());
      }
      return true;
    case "MATCHES":
      if (typeof actual === "string" && typeof expected === "string") {
        try {
          const reg = new RegExp(expected, "i");
          return reg.test(actual);
        } catch {
          return false;
        }
      }
      return false;
    case "EXISTS":
      return actual !== void 0 && actual !== null && actual !== false && actual !== "" && (!Array.isArray(actual) || actual.length > 0);
    case "NOT_EXISTS":
      return actual === void 0 || actual === null || actual === "" || Array.isArray(actual) && actual.length === 0;
    case "COUNT_AT_LEAST":
      if (Array.isArray(actual)) {
        return actual.length >= Number(expected);
      }
      if (typeof actual === "number") {
        return actual >= Number(expected);
      }
      return false;
    case "COUNT_AT_MOST":
      if (Array.isArray(actual)) {
        return actual.length <= Number(expected);
      }
      if (typeof actual === "number") {
        return actual <= Number(expected);
      }
      return false;
    case "THRESHOLD_AT_LEAST":
      return Number(actual) >= Number(expected);
    case "THRESHOLD_AT_MOST":
      return Number(actual) <= Number(expected);
    case "ANY":
      if (Array.isArray(actual) && Array.isArray(expected)) {
        return actual.some((a) => expected.includes(a));
      }
      return false;
    case "ALL":
      if (Array.isArray(actual) && Array.isArray(expected)) {
        return expected.every((e) => actual.includes(e));
      }
      return false;
    case "NONE":
      if (Array.isArray(actual) && Array.isArray(expected)) {
        return !actual.some((a) => expected.includes(a));
      }
      return true;
    default:
      return false;
  }
}
function evaluateCriterion(criterion, context, policies) {
  const weight = criterion.weight ?? (criterion.mandatory ? 10 : 5);
  const evidence = [];
  let actualValue = void 0;
  let isMissing = false;
  let isContradictory = false;
  let contradictionReason = "";
  let reasonCode = "";
  let explanation = "";
  switch (criterion.type) {
    case "RELEVANCE": {
      actualValue = context.relevanceResult?.relevanceState;
      if (!actualValue) {
        isMissing = true;
      } else {
        if (context.relevanceResult?.evidenceItems) {
          evidence.push(...context.relevanceResult.evidenceItems);
        }
      }
      break;
    }
    case "WEBSITE_STATUS": {
      actualValue = context.websiteState || context.mapsVerificationResult?.websiteState || context.normalizedCandidate?.verificationPlaceholder?.verificationStatus;
      if (!actualValue) {
        isMissing = true;
      } else {
        if (context.websiteEvidence) {
          evidence.push(...context.websiteEvidence);
        }
        if (context.mapsVerificationResult?.verificationEvidence) {
          evidence.push(...context.mapsVerificationResult.verificationEvidence);
        }
      }
      break;
    }
    case "BUSINESS_IDENTITY": {
      const biConflict = context.businessIntelligence?.identity.canonicalBusinessName.state === "CONTRADICTORY";
      const isConflict = biConflict || context.resolvedEntityGroup?.resolutionStatus === "CONFLICTING_IDENTITY" || context.resolvedEntityGroup?.relationshipType === "CONFLICTING_IDENTITY" || context.resolvedEntityGroup?.identityConflicts && context.resolvedEntityGroup.identityConflicts.length > 0 || context.contactEnrichment?.diagnostics?.warnings?.some((w) => w.includes("conflicts with candidate name"));
      if (isConflict) {
        isContradictory = true;
        contradictionReason = "Business identity contradiction detected across source records";
      }
      actualValue = isConflict ? "CONTRADICTION" : context.businessIntelligence?.identity.canonicalBusinessName.value || context.canonicalDisplayName || context.normalizedCandidate?.businessName?.value?.displayName;
      if (!actualValue) isMissing = true;
      if (context.businessIntelligence?.identity.canonicalBusinessName.sourceContributions) {
        evidence.push(...context.businessIntelligence.identity.canonicalBusinessName.sourceContributions);
      }
      break;
    }
    case "HAS_BUSINESS_PHONE": {
      if (context.businessIntelligence?.contactPresence.publicPhonePresent.state === "CONTRADICTORY") {
        isContradictory = true;
        contradictionReason = "Conflicting phone numbers observed across distinct sources";
      }
      const enrichmentPhones = context.contactEnrichment?.phones || [];
      const candidatePhones = context.normalizedCandidate?.phones || [];
      const biPhones = context.businessIntelligence?.contactPresence.publicPhonePresent.value ? [context.businessIntelligence.contactPresence.publicPhonePresent.value] : [];
      const hasPhones = enrichmentPhones.length > 0 || candidatePhones.length > 0 || biPhones.length > 0;
      actualValue = enrichmentPhones.length > 0 ? enrichmentPhones : candidatePhones.length > 0 ? candidatePhones : biPhones;
      if (!hasPhones) {
        isMissing = true;
      } else {
        for (const p of enrichmentPhones) {
          if (p.evidence) evidence.push(...p.evidence);
        }
        for (const cp of candidatePhones) {
          if (cp.sourceContributions) evidence.push(...cp.sourceContributions);
        }
        if (context.businessIntelligence?.contactPresence.publicPhonePresent.sourceContributions) {
          evidence.push(...context.businessIntelligence.contactPresence.publicPhonePresent.sourceContributions);
        }
      }
      break;
    }
    case "HAS_BUSINESS_EMAIL": {
      if (context.businessIntelligence?.contactPresence.publicEmailPresent.state === "CONTRADICTORY") {
        isContradictory = true;
        contradictionReason = "Conflicting email records observed across sources";
      }
      const enrichmentEmails = context.contactEnrichment?.emails || [];
      const candidateEmails = context.normalizedCandidate?.emails || [];
      const biEmails = context.businessIntelligence?.contactPresence.publicEmailPresent.value ? [context.businessIntelligence.contactPresence.publicEmailPresent.value] : [];
      const hasEmails = enrichmentEmails.length > 0 || candidateEmails.length > 0 || biEmails.length > 0;
      actualValue = enrichmentEmails.length > 0 ? enrichmentEmails : candidateEmails.length > 0 ? candidateEmails : biEmails;
      if (!hasEmails) {
        isMissing = true;
      } else {
        for (const e of enrichmentEmails) {
          if (e.evidence) evidence.push(...e.evidence);
        }
        for (const ce of candidateEmails) {
          if (ce.sourceContributions) evidence.push(...ce.sourceContributions);
        }
        if (context.businessIntelligence?.contactPresence.publicEmailPresent.sourceContributions) {
          evidence.push(...context.businessIntelligence.contactPresence.publicEmailPresent.sourceContributions);
        }
      }
      break;
    }
    case "HAS_BUSINESS_ADDRESS": {
      if (context.businessIntelligence?.location.address.state === "CONTRADICTORY") {
        isContradictory = true;
        contradictionReason = "Address conflict detected across distinct sources";
      }
      const enrichmentAddresses = context.contactEnrichment?.addresses || [];
      const candidateAddress = context.normalizedCandidate?.address ? [context.normalizedCandidate.address] : [];
      const biAddress = context.businessIntelligence?.location.address.value ? [context.businessIntelligence.location.address.value] : [];
      const hasAddresses = enrichmentAddresses.length > 0 || candidateAddress.length > 0 || biAddress.length > 0;
      actualValue = enrichmentAddresses.length > 0 ? enrichmentAddresses : candidateAddress.length > 0 ? candidateAddress : biAddress;
      if (!hasAddresses) {
        isMissing = true;
      } else {
        for (const a of enrichmentAddresses) {
          if (a.evidence) evidence.push(...a.evidence);
        }
        for (const ca of candidateAddress) {
          if (ca.sourceContributions) evidence.push(...ca.sourceContributions);
        }
        if (context.businessIntelligence?.location.address.sourceContributions) {
          evidence.push(...context.businessIntelligence.location.address.sourceContributions);
        }
      }
      break;
    }
    case "HAS_CONTACT_FORM": {
      const forms = context.contactEnrichment?.contactForms || [];
      const biForm = context.businessIntelligence?.digitalPresence.contactFormPresent.value;
      actualValue = forms.some((f) => f.present) || (biForm === true ? true : void 0);
      if (forms.length === 0 && biForm === void 0) {
        isMissing = true;
      } else {
        for (const f of forms) {
          if (f.evidence) evidence.push(...f.evidence);
        }
        if (context.businessIntelligence?.digitalPresence.contactFormPresent.sourceContributions) {
          evidence.push(...context.businessIntelligence.digitalPresence.contactFormPresent.sourceContributions);
        }
      }
      break;
    }
    case "HAS_SOCIAL_PROFILE": {
      const socials = context.contactEnrichment?.socialProfiles || [];
      const biSocials = context.businessIntelligence?.digitalPresence.socialPresence.value || [];
      actualValue = socials.length > 0 ? socials.map((s) => s.platform) : biSocials.length > 0 ? biSocials : void 0;
      if (socials.length === 0 && biSocials.length === 0) {
        isMissing = true;
      } else {
        for (const s of socials) {
          if (s.evidence) evidence.push(...s.evidence);
        }
        if (context.businessIntelligence?.digitalPresence.socialPresence.sourceContributions) {
          evidence.push(...context.businessIntelligence.digitalPresence.socialPresence.sourceContributions);
        }
      }
      break;
    }
    case "LOCATION_MATCH": {
      const country = context.businessIntelligence?.location.country.value || context.normalizedCandidate?.address?.value?.countryCode || context.normalizedCandidate?.location?.value?.countryCode || context.contactEnrichment?.addresses?.[0]?.country;
      const city = context.businessIntelligence?.location.city.value || context.normalizedCandidate?.address?.value?.locality || context.normalizedCandidate?.location?.value?.city || context.contactEnrichment?.addresses?.[0]?.city;
      actualValue = { country, city };
      if (!country && !city) {
        isMissing = true;
      }
      break;
    }
    case "CATEGORY_MATCH": {
      actualValue = context.businessIntelligence?.identity.primaryCategory.value || context.normalizedCandidate?.categories?.[0]?.value?.normalizedCategory || context.normalizedCandidate?.category?.normalizedCategory || context.normalizedCandidate?.category || context.relevanceResult?.evidenceItems?.find((e) => e.evidenceType === "CATEGORY_EVIDENCE")?.observedValue;
      if (!actualValue) isMissing = true;
      break;
    }
    case "NAME_MATCH": {
      if (context.businessIntelligence?.identity.canonicalBusinessName.state === "CONTRADICTORY") {
        isContradictory = true;
        contradictionReason = "Conflicting business names observed across distinct sources";
      }
      actualValue = context.businessIntelligence?.identity.canonicalBusinessName.value || context.canonicalDisplayName || context.normalizedCandidate?.businessName?.value?.displayName || context.contactEnrichment?.businessName?.normalizedName;
      if (!actualValue) isMissing = true;
      break;
    }
    case "NEGATIVE_EVIDENCE": {
      const hasNegativeRelevance = context.relevanceResult?.relevanceState === "NOT_RELEVANT";
      const hasNegativeWeb = context.websiteState === "WEBSITE_NON_BUSINESS" || context.websiteState === "WEBSITE_PARKED";
      actualValue = hasNegativeRelevance || hasNegativeWeb;
      break;
    }
    case "SOURCE_EVIDENCE_REQUIREMENT": {
      const allContribs = [
        ...context.sourceContributions || [],
        ...context.contactEnrichment?.sourceContributions || []
      ];
      actualValue = allContribs.map((c) => c.provenance);
      if (allContribs.length === 0) isMissing = true;
      break;
    }
    case "COMPLETENESS_THRESHOLD": {
      actualValue = context.businessIntelligence?.completenessMetrics.businessCompleteness ?? context.contactEnrichment?.completeness;
      if (actualValue === void 0 || actualValue === null) isMissing = true;
      break;
    }
    // ==========================================
    // Phase 23 Business Intelligence Criteria
    // ==========================================
    case "VERIFIED_BUSINESS_WEBSITE": {
      const biWeb = context.businessIntelligence?.digitalPresence.verifiedWebsite;
      if (biWeb?.state === "CONTRADICTORY") {
        isContradictory = true;
        contradictionReason = "Conflicting website domains detected";
      }
      const isVerified = biWeb?.value === true || context.businessIntelligence?.digitalPresence.websitePresent.value === true || context.websiteState === "WEBSITE_VERIFIED_BUSINESS_SITE";
      actualValue = isVerified ? true : void 0;
      if (actualValue === void 0) {
        isMissing = true;
      } else {
        if (biWeb?.sourceContributions) evidence.push(...biWeb.sourceContributions);
        if (context.websiteEvidence) evidence.push(...context.websiteEvidence);
      }
      break;
    }
    case "PUBLISHED_SERVICES": {
      const biServices = context.businessIntelligence?.businessActivity.publishedServices;
      if (biServices?.state === "CONTRADICTORY") {
        isContradictory = true;
        contradictionReason = "Contradictory service offerings reported";
      }
      const services = biServices?.value ?? context.websiteIntelligence?.services ?? [];
      actualValue = Array.isArray(services) && services.length > 0 ? services : void 0;
      if (!actualValue) {
        isMissing = true;
      } else {
        if (biServices?.sourceContributions) evidence.push(...biServices.sourceContributions);
      }
      break;
    }
    case "SERVICE_AREA_MATCH": {
      const areas = context.businessIntelligence?.location.serviceAreas.value ?? context.websiteIntelligence?.serviceAreas ?? [];
      actualValue = Array.isArray(areas) && areas.length > 0 ? areas : void 0;
      if (!actualValue) {
        isMissing = true;
      } else {
        if (context.businessIntelligence?.location.serviceAreas.sourceContributions) {
          evidence.push(...context.businessIntelligence.location.serviceAreas.sourceContributions);
        }
      }
      break;
    }
    case "BUSINESS_HOURS_PRESENT": {
      const hours = context.businessIntelligence?.businessActivity.businessHours.value;
      actualValue = hours && Object.keys(hours).length > 0 ? hours : void 0;
      if (!actualValue) {
        isMissing = true;
      } else {
        if (context.businessIntelligence?.businessActivity.businessHours.sourceContributions) {
          evidence.push(...context.businessIntelligence.businessActivity.businessHours.sourceContributions);
        }
      }
      break;
    }
    case "DIGITAL_BOOKING_PRESENT": {
      const booking = context.businessIntelligence?.digitalPresence.bookingSystemPresent.value ?? context.websiteIntelligence?.technologies?.booking;
      actualValue = booking === true ? true : void 0;
      if (actualValue === void 0) isMissing = true;
      if (context.businessIntelligence?.digitalPresence.bookingSystemPresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.digitalPresence.bookingSystemPresent.sourceContributions);
      }
      break;
    }
    case "DIGITAL_ECOMMERCE_PRESENT": {
      const ecom = context.businessIntelligence?.digitalPresence.ecommercePresent.value ?? context.websiteIntelligence?.technologies?.ecommerce;
      actualValue = ecom === true ? true : void 0;
      if (actualValue === void 0) isMissing = true;
      if (context.businessIntelligence?.digitalPresence.ecommercePresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.digitalPresence.ecommercePresent.sourceContributions);
      }
      break;
    }
    case "DIGITAL_CHAT_PRESENT": {
      const chat = context.businessIntelligence?.digitalPresence.chatPresent.value ?? context.websiteIntelligence?.technologies?.chat;
      actualValue = chat === true ? true : void 0;
      if (actualValue === void 0) isMissing = true;
      if (context.businessIntelligence?.digitalPresence.chatPresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.digitalPresence.chatPresent.sourceContributions);
      }
      break;
    }
    case "DIGITAL_ANALYTICS_PRESENT": {
      const analytics = context.businessIntelligence?.digitalPresence.analyticsTechnologyPresent.value ?? context.websiteIntelligence?.technologies?.analytics;
      actualValue = analytics === true ? true : void 0;
      if (actualValue === void 0) isMissing = true;
      if (context.businessIntelligence?.digitalPresence.analyticsTechnologyPresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.digitalPresence.analyticsTechnologyPresent.sourceContributions);
      }
      break;
    }
    case "DIGITAL_CMS_DETECTED": {
      const cms = context.businessIntelligence?.digitalPresence?.cmsDetected?.value ?? context.websiteIntelligence?.technologies?.cms;
      actualValue = cms ? cms : void 0;
      if (!actualValue) isMissing = true;
      break;
    }
    case "PUBLIC_EMAIL_AVAILABLE": {
      if (context.businessIntelligence?.contactPresence.publicEmailPresent.state === "CONTRADICTORY") {
        isContradictory = true;
        contradictionReason = "Email contradiction observed";
      }
      const hasEmail = context.businessIntelligence?.contactPresence.publicEmailPresent.value ?? ((context.contactEnrichment?.emails?.length ?? 0) > 0 || (context.normalizedCandidate?.emails?.length ?? 0) > 0);
      actualValue = hasEmail ? true : void 0;
      if (actualValue === void 0) isMissing = true;
      if (context.businessIntelligence?.contactPresence.publicEmailPresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.contactPresence.publicEmailPresent.sourceContributions);
      }
      break;
    }
    case "ROLE_EMAIL_AVAILABLE": {
      const roleEmail = context.businessIntelligence?.contactPresence.roleEmailPresent.value;
      actualValue = roleEmail === true ? true : void 0;
      if (actualValue === void 0) isMissing = true;
      if (context.businessIntelligence?.contactPresence.roleEmailPresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.contactPresence.roleEmailPresent.sourceContributions);
      }
      break;
    }
    case "PERSON_EMAIL_AVAILABLE": {
      const personEmail = context.businessIntelligence?.contactPresence.personEmailPresent.value;
      actualValue = personEmail === true ? true : void 0;
      if (actualValue === void 0) isMissing = true;
      if (context.businessIntelligence?.contactPresence.personEmailPresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.contactPresence.personEmailPresent.sourceContributions);
      }
      break;
    }
    case "PUBLIC_PHONE_AVAILABLE": {
      if (context.businessIntelligence?.contactPresence.publicPhonePresent.state === "CONTRADICTORY") {
        isContradictory = true;
        contradictionReason = "Phone contradiction observed";
      }
      const hasPhone = context.businessIntelligence?.contactPresence.publicPhonePresent.value ?? ((context.contactEnrichment?.phones?.length ?? 0) > 0 || (context.normalizedCandidate?.phones?.length ?? 0) > 0);
      actualValue = hasPhone ? true : void 0;
      if (actualValue === void 0) isMissing = true;
      if (context.businessIntelligence?.contactPresence.publicPhonePresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.contactPresence.publicPhonePresent.sourceContributions);
      }
      break;
    }
    case "PERSON_PHONE_AVAILABLE": {
      const personPhone = context.businessIntelligence?.contactPresence.personPhonePresent.value;
      actualValue = personPhone === true ? true : void 0;
      if (actualValue === void 0) isMissing = true;
      if (context.businessIntelligence?.contactPresence.personPhonePresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.contactPresence.personPhonePresent.sourceContributions);
      }
      break;
    }
    case "PUBLIC_PERSON_AVAILABLE": {
      const publicPerson = context.businessIntelligence?.contactPresence.publicPersonPresent.value;
      actualValue = publicPerson === true ? true : void 0;
      if (actualValue === void 0) isMissing = true;
      if (context.businessIntelligence?.contactPresence.publicPersonPresent.sourceContributions) {
        evidence.push(...context.businessIntelligence.contactPresence.publicPersonPresent.sourceContributions);
      }
      break;
    }
    case "PERSON_WITH_TITLE_AVAILABLE": {
      const personWithTitle = context.businessIntelligence?.contactPresence?.personWithTitlePresent?.value;
      actualValue = personWithTitle === true ? true : void 0;
      if (actualValue === void 0) isMissing = true;
      break;
    }
    case "CROSS_SOURCE_CORROBORATION": {
      const count = context.businessIntelligence?.completenessMetrics.sourceCorroborationCount ?? (context.businessIntelligence?.crossSourceCorroborations?.length ?? 0);
      actualValue = count;
      if (count === 0) isMissing = true;
      if (context.businessIntelligence?.crossSourceCorroborations) {
        evidence.push(...context.businessIntelligence.crossSourceCorroborations);
      }
      break;
    }
    case "CORROBORATED_PHONE": {
      const sig = context.businessIntelligence?.contactPresence.publicPhonePresent;
      if (sig?.state === "CONTRADICTORY") {
        isContradictory = true;
        contradictionReason = "Phone conflict observed between sources";
      }
      const corroborated = sig?.state === "CORROBORATED" || sig?.corroborationSources && sig.corroborationSources.length > 1;
      actualValue = corroborated ? true : void 0;
      if (!actualValue) isMissing = true;
      if (sig?.sourceContributions) evidence.push(...sig.sourceContributions);
      break;
    }
    case "CORROBORATED_IDENTITY": {
      const sig = context.businessIntelligence?.identity.canonicalBusinessName;
      if (sig?.state === "CONTRADICTORY") {
        isContradictory = true;
        contradictionReason = "Business identity contradiction between sources";
      }
      const corroborated = sig?.state === "CORROBORATED" || sig?.corroborationSources && sig.corroborationSources.length > 1;
      actualValue = corroborated ? true : void 0;
      if (!actualValue) isMissing = true;
      if (sig?.sourceContributions) evidence.push(...sig.sourceContributions);
      break;
    }
    case "META_AD_ACTIVE": {
      const adSig = context.businessIntelligence?.advertisingSignals.adPresenceState;
      actualValue = adSig?.value;
      if (adSig?.freshnessState === "STALE") {
        isMissing = true;
      } else if (!actualValue) {
        isMissing = true;
      } else {
        if (adSig?.sourceContributions) evidence.push(...adSig.sourceContributions);
      }
      break;
    }
    case "EVIDENCE_COVERAGE_THRESHOLD": {
      actualValue = context.businessIntelligence?.completenessMetrics.evidenceCoverage;
      if (actualValue === void 0 || actualValue === null) isMissing = true;
      break;
    }
    case "BUSINESS_COMPLETENESS_THRESHOLD": {
      actualValue = context.businessIntelligence?.completenessMetrics.businessCompleteness;
      if (actualValue === void 0 || actualValue === null) isMissing = true;
      break;
    }
    case "TEMPORAL_FRESHNESS": {
      const freshness = context.businessIntelligence?.advertisingSignals.adPresenceState.freshnessState || context.businessIntelligence?.digitalPresence.verifiedWebsite.freshnessState;
      actualValue = freshness;
      if (!actualValue || actualValue === "UNKNOWN") isMissing = true;
      break;
    }
    case "CUSTOM_FIELD": {
      if (criterion.field) {
        const resolvePath = (obj, path) => {
          if (!obj) return void 0;
          return path.split(".").reduce((curr, key) => curr !== null && curr !== void 0 ? curr[key] : void 0, obj);
        };
        actualValue = resolvePath(context, criterion.field) ?? resolvePath(context.normalizedCandidate, criterion.field) ?? resolvePath(context.businessIntelligence, criterion.field) ?? resolvePath(context.contactEnrichment, criterion.field);
      }
      if (actualValue === void 0 || actualValue === null) isMissing = true;
      break;
    }
  }
  const matchingContrib = context.sourceContributions?.find(
    (c) => c.fieldName === criterion.field || c.fieldName === criterion.type.toLowerCase() || criterion.type.includes("PHONE") && c.fieldName.toLowerCase().includes("phone") || criterion.type.includes("EMAIL") && c.fieldName.toLowerCase().includes("email") || criterion.type.includes("WEBSITE") && c.fieldName.toLowerCase().includes("website") || criterion.type.includes("ADDRESS") && c.fieldName.toLowerCase().includes("address")
  );
  const policyCheck = checkQualificationEligibility(matchingContrib);
  if (policyCheck.isBlocked) {
    return {
      criterionId: criterion.id,
      criterionType: criterion.type,
      operator: criterion.operator,
      expectedValue: criterion.expectedValue,
      actualValue,
      outcome: "BLOCKED",
      mandatory: criterion.mandatory,
      weight,
      scoreContribution: 0,
      evidence,
      reasonCode: "CRITERION_BLOCKED_BY_POLICY",
      explanation: `Evaluation blocked: ${policyCheck.reason || "Source compliance restriction"}`
    };
  }
  if (isContradictory && policies.conflictPolicy === "STRICT_CONTRADICTION") {
    return {
      criterionId: criterion.id,
      criterionType: criterion.type,
      operator: criterion.operator,
      expectedValue: criterion.expectedValue,
      actualValue,
      outcome: "CONTRADICTORY",
      mandatory: criterion.mandatory,
      weight,
      scoreContribution: 0,
      evidence,
      reasonCode: "CRITERION_CONTRADICTORY",
      explanation: `Contradiction detected: ${contradictionReason}`
    };
  }
  if (isMissing) {
    if (policies.missingDataPolicy === "MISSING_FAILS_REQUIRED") {
      return {
        criterionId: criterion.id,
        criterionType: criterion.type,
        operator: criterion.operator,
        expectedValue: criterion.expectedValue,
        actualValue: void 0,
        outcome: "FAIL",
        mandatory: criterion.mandatory,
        weight,
        scoreContribution: 0,
        evidence: [],
        reasonCode: "MISSING_DATA_FAILS",
        explanation: `Mandatory evidence for '${criterion.id}' is missing; policy classifies missing as FAIL.`
      };
    } else if (policies.missingDataPolicy === "MISSING_ALLOWED") {
      return {
        criterionId: criterion.id,
        criterionType: criterion.type,
        operator: criterion.operator,
        expectedValue: criterion.expectedValue,
        actualValue: void 0,
        outcome: "PASS",
        mandatory: criterion.mandatory,
        weight,
        scoreContribution: weight,
        evidence: [],
        reasonCode: "MISSING_DATA_ALLOWED",
        explanation: `Evidence for '${criterion.id}' is absent; policy permits missing data as PASS.`
      };
    } else {
      return {
        criterionId: criterion.id,
        criterionType: criterion.type,
        operator: criterion.operator,
        expectedValue: criterion.expectedValue,
        actualValue: void 0,
        outcome: "UNKNOWN",
        mandatory: criterion.mandatory,
        weight,
        scoreContribution: 0,
        evidence: [],
        reasonCode: "MISSING_DATA_UNKNOWN",
        explanation: `Evidence for '${criterion.id}' is currently unknown or unobserved.`
      };
    }
  }
  let passed = false;
  if (criterion.type === "LOCATION_MATCH" && typeof criterion.expectedValue === "object") {
    const locActual = actualValue || {};
    let countryPass = true;
    let cityPass = true;
    if (criterion.expectedValue.country) {
      countryPass = evaluateOperator(criterion.operator, locActual.country, criterion.expectedValue.country);
    }
    if (criterion.expectedValue.city) {
      cityPass = evaluateOperator(criterion.operator, locActual.city, criterion.expectedValue.city);
    }
    passed = countryPass && cityPass;
  } else {
    passed = evaluateOperator(criterion.operator, actualValue, criterion.expectedValue);
  }
  const outcome = passed ? "PASS" : "FAIL";
  const scoreContribution = passed ? weight : 0;
  reasonCode = passed ? "CRITERION_SATISFIED" : "CRITERION_UNSATISFIED";
  explanation = passed ? `Criterion '${criterion.id}' (${criterion.type}) passed: observed value satisfied operator ${criterion.operator}.` : `Criterion '${criterion.id}' (${criterion.type}) failed: observed value did not satisfy operator ${criterion.operator}.`;
  return {
    criterionId: criterion.id,
    criterionType: criterion.type,
    operator: criterion.operator,
    expectedValue: criterion.expectedValue,
    actualValue,
    outcome,
    mandatory: criterion.mandatory,
    weight,
    scoreContribution,
    evidence,
    reasonCode,
    explanation
  };
}

// src/extension/qualification/qualificationScorer.ts
function calculateQualificationScore(criterionResults, profile) {
  let totalScore = 0;
  let maxPossibleScore = 0;
  for (const cr of criterionResults) {
    maxPossibleScore += cr.weight;
    if (cr.outcome === "PASS") {
      totalScore += cr.scoreContribution;
    }
  }
  const threshold = profile.thresholds?.minimumScore ?? 0;
  const thresholdPassed = totalScore >= threshold;
  return {
    totalScore,
    maxPossibleScore,
    threshold,
    thresholdPassed
  };
}

// src/extension/qualification/qualificationExplainer.ts
function buildExplanationLedger(status, criterionResults, scoreSummary) {
  const blockingReasons = [];
  const contradictionReasons = [];
  const unknownReasons = [];
  const failureReasons = [];
  const supportingEvidence = [];
  for (const cr of criterionResults) {
    if (cr.evidence && cr.evidence.length > 0) {
      supportingEvidence.push(...cr.evidence);
    }
    if (cr.outcome === "BLOCKED") {
      blockingReasons.push(cr.explanation);
    } else if (cr.outcome === "CONTRADICTORY") {
      contradictionReasons.push(cr.explanation);
    } else if (cr.outcome === "UNKNOWN") {
      if (cr.mandatory) {
        unknownReasons.push(cr.explanation);
      }
    } else if (cr.outcome === "FAIL") {
      if (cr.mandatory) {
        failureReasons.push(cr.explanation);
      }
    }
  }
  let summaryNarrative = "";
  switch (status) {
    case "QUALIFIED":
      summaryNarrative = `Candidate successfully satisfied all mandatory qualification criteria (Score: ${scoreSummary.totalScore}/${scoreSummary.maxPossibleScore}, Threshold: ${scoreSummary.threshold}).`;
      break;
    case "NOT_QUALIFIED":
      if (failureReasons.length > 0) {
        summaryNarrative = `Candidate failed ${failureReasons.length} mandatory qualification requirement(s): ${failureReasons.join("; ")}`;
      } else if (!scoreSummary.thresholdPassed) {
        summaryNarrative = `Candidate score (${scoreSummary.totalScore}) fell below the configured minimum threshold (${scoreSummary.threshold}).`;
      } else {
        summaryNarrative = "Candidate did not satisfy configured qualification criteria.";
      }
      break;
    case "UNCERTAIN":
      summaryNarrative = `Qualification is uncertain due to unresolved or missing mandatory facts: ${unknownReasons.join("; ")}`;
      break;
    case "BLOCKED":
      summaryNarrative = `Qualification evaluation was blocked by compliance or source restrictions: ${blockingReasons.join("; ")}`;
      break;
  }
  return {
    blockingReasons,
    contradictionReasons,
    unknownReasons,
    failureReasons,
    supportingEvidence,
    summaryNarrative
  };
}

// src/extension/qualification/qualificationEvaluator.ts
var QUALIFICATION_EVALUATOR_VERSION = "1.0.0";
function evaluateLeadQualification(context, profile) {
  const errors = [];
  const warnings = [];
  const notices = [];
  const evaluatedAt = context.evaluatedAt || (/* @__PURE__ */ new Date()).toISOString();
  const validation = validateQualificationProfile(profile);
  if (!validation.isValid) {
    return {
      entityId: context.entityId,
      status: "BLOCKED",
      profileId: profile?.profileId || "UNKNOWN_PROFILE",
      profileVersion: profile?.version || "0.0.0",
      evaluatorVersion: QUALIFICATION_EVALUATOR_VERSION,
      evaluatedAt,
      criterionResults: [],
      scoreSummary: {
        totalScore: 0,
        maxPossibleScore: 0,
        threshold: 0,
        thresholdPassed: false
      },
      blockingReasons: [`Profile validation failed: ${validation.errors.join("; ")}`],
      contradictionReasons: [],
      unknownReasons: [],
      failureReasons: [],
      supportingEvidence: [],
      provenance: "LEADNORIA_DERIVED",
      sourceContributions: context.sourceContributions || [],
      derivedFrom: context.derivedFrom || [],
      sourceRestrictions: {
        isRestricted: false,
        restrictionBasis: "NONE",
        policyStatus: "PRODUCT_REJECTED",
        persistenceEligibility: "NOT_PERSISTABLE",
        exportEligibility: "NOT_EXPORTABLE"
      },
      diagnostics: {
        errors: validation.errors,
        warnings: validation.warnings,
        notices: ["Evaluation halted due to invalid qualification profile configuration."]
      }
    };
  }
  const sortedCriteria = [...profile.criteria].sort((a, b) => a.id.localeCompare(b.id));
  const criterionResults = [];
  for (const criterion of sortedCriteria) {
    const res = evaluateCriterion(criterion, context, {
      missingDataPolicy: profile.missingDataPolicy,
      unknownDataPolicy: profile.unknownDataPolicy,
      conflictPolicy: profile.conflictPolicy
    });
    criterionResults.push(res);
  }
  const scoreSummary = calculateQualificationScore(criterionResults, profile);
  let finalStatus = "QUALIFIED";
  const mandatoryBlocked = criterionResults.some((cr) => cr.mandatory && cr.outcome === "BLOCKED");
  const mandatoryContradictory = criterionResults.some((cr) => cr.mandatory && cr.outcome === "CONTRADICTORY");
  const mandatoryFailed = criterionResults.some((cr) => cr.mandatory && cr.outcome === "FAIL");
  const mandatoryUnknown = criterionResults.some((cr) => cr.mandatory && cr.outcome === "UNKNOWN");
  if (mandatoryBlocked) {
    finalStatus = "BLOCKED";
  } else if (mandatoryContradictory) {
    finalStatus = "UNCERTAIN";
  } else if (mandatoryFailed) {
    finalStatus = "NOT_QUALIFIED";
  } else if (mandatoryUnknown) {
    if (profile.unknownDataPolicy === "UNKNOWN_FAILS_MANDATORY") {
      finalStatus = "NOT_QUALIFIED";
    } else {
      finalStatus = "UNCERTAIN";
    }
  } else {
    if (!scoreSummary.thresholdPassed) {
      finalStatus = "NOT_QUALIFIED";
    } else {
      finalStatus = "QUALIFIED";
    }
  }
  const explanationLedger = buildExplanationLedger(finalStatus, criterionResults, scoreSummary);
  const reasonNodes = criterionResults.map((cr) => ({
    criterionId: cr.criterionId,
    criterionType: cr.criterionType,
    outcome: cr.outcome,
    mandatory: cr.mandatory,
    weight: cr.weight,
    scoreContribution: cr.scoreContribution,
    explanation: cr.explanation,
    evidenceCount: cr.evidence.length,
    sources: Array.from(new Set(cr.evidence.map((e) => e.source || e.provenance).filter(Boolean)))
  }));
  const reasonGraph = {
    finalStatus,
    primaryRationale: explanationLedger.summaryNarrative,
    summaryText: `Candidate ${context.entityId} evaluated to ${finalStatus} under profile ${profile.profileId}.`,
    nodes: reasonNodes,
    passingFactors: criterionResults.filter((c) => c.outcome === "PASS").map((c) => c.explanation),
    failingFactors: criterionResults.filter((c) => c.outcome === "FAIL").map((c) => c.explanation),
    uncertainFactors: criterionResults.filter((c) => c.outcome === "UNKNOWN").map((c) => c.explanation),
    contradictoryFactors: criterionResults.filter((c) => c.outcome === "CONTRADICTORY").map((c) => c.explanation),
    blockingFactors: criterionResults.filter((c) => c.outcome === "BLOCKED").map((c) => c.explanation)
  };
  const compositeRestrictions = deriveCompositeRestrictions(context);
  return {
    entityId: context.entityId,
    status: finalStatus,
    profileId: profile.profileId,
    profileVersion: profile.version,
    evaluatorVersion: QUALIFICATION_EVALUATOR_VERSION,
    evaluatedAt,
    criterionResults,
    scoreSummary,
    blockingReasons: explanationLedger.blockingReasons,
    contradictionReasons: explanationLedger.contradictionReasons,
    unknownReasons: explanationLedger.unknownReasons,
    failureReasons: explanationLedger.failureReasons,
    supportingEvidence: explanationLedger.supportingEvidence,
    provenance: compositeRestrictions.provenance,
    sourceContributions: compositeRestrictions.sourceContributions,
    derivedFrom: compositeRestrictions.derivedFrom,
    sourceRestrictions: {
      isRestricted: compositeRestrictions.isRestricted,
      restrictionBasis: compositeRestrictions.restrictionBasis,
      policyStatus: compositeRestrictions.policyStatus,
      persistenceEligibility: compositeRestrictions.persistenceEligibility,
      exportEligibility: compositeRestrictions.exportEligibility
    },
    diagnostics: {
      errors,
      warnings,
      notices: [explanationLedger.summaryNarrative]
    },
    reasonGraph,
    completenessMetrics: context.businessIntelligence?.completenessMetrics
  };
}

// src/extension/qualification/businessIntelligence.ts
function normalizeForComparison(str) {
  return (str || "").normalize("NFC").replace(/[^\p{L}\p{N}\s]/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}
function normalizePhoneDigits(phone) {
  let digits = (phone || "").replace(/[^0-9]/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  return digits;
}
function evaluateTemporalFreshness(timestamp, maxAgeDays = 90) {
  if (!timestamp) return "UNKNOWN";
  try {
    const obsTime = new Date(timestamp).getTime();
    if (isNaN(obsTime)) return "UNKNOWN";
    const now = Date.now();
    const diffDays = (now - obsTime) / (1e3 * 60 * 60 * 24);
    if (diffDays < 0) return "CURRENT";
    return diffDays <= maxAgeDays ? "CURRENT" : "STALE";
  } catch {
    return "UNKNOWN";
  }
}
function createSignal(value, state, source, provenance, observedAt, sourceUrl, extra) {
  const isGoogle = provenance === "GOOGLE_DERIVED";
  const contrib = {
    source,
    provenance,
    fieldName: "signal",
    acquisitionContext: isGoogle ? "GOOGLE_CONSUMER_WEB" : provenance === "META_DERIVED" ? "META_AD_LIBRARY" : "WEBSITE_DIRECT",
    restrictionBasis: isGoogle ? "GOOGLE_CONSUMER_WEB_RESTRICTED" : "NONE",
    isRestricted: isGoogle,
    policyStatus: isGoogle ? "PRODUCT_REJECTED" : "POLICY_APPROVED",
    persistenceStatus: isGoogle ? "NOT_PERSISTABLE" : "PERSISTABLE",
    exportStatus: isGoogle ? "NOT_EXPORTABLE" : "EXPORTABLE"
  };
  return {
    value,
    state,
    source,
    sourceUrl,
    observedAt,
    firstObservedAt: extra?.firstObservedAt || observedAt,
    lastObservedAt: extra?.lastObservedAt || observedAt,
    provenance,
    sourceContributions: [contrib],
    corroborationSources: extra?.corroborationSources,
    conflicts: extra?.conflicts,
    freshnessState: extra?.freshnessState || evaluateTemporalFreshness(observedAt)
  };
}
function buildBusinessIntelligenceProfile(params) {
  const observedAt = params.observedAt || (/* @__PURE__ */ new Date()).toISOString();
  const maxAgeDays = params.freshnessMaxAgeDays || 90;
  const conflicts = [];
  const corroborationDetails = [];
  const isGoogleRestricted = Boolean(
    params.googleCandidate?.isRestricted || params.candidate?.overallProvenance === "GOOGLE_DERIVED" || params.candidate?.sourceContributions?.some((c) => c.provenance === "GOOGLE_DERIVED" || c.restrictionBasis === "GOOGLE_CONSUMER_WEB_RESTRICTED")
  );
  let rootProvenance = "WEBSITE_DERIVED";
  if (isGoogleRestricted || params.candidate?.overallProvenance === "GOOGLE_DERIVED") {
    rootProvenance = "GOOGLE_DERIVED";
  } else if (params.metaCandidate || params.candidate?.overallProvenance === "META_DERIVED") {
    rootProvenance = "META_DERIVED";
  } else if (params.userProvidedUrl || params.candidate?.overallProvenance === "USER_PROVIDED") {
    rootProvenance = "USER_PROVIDED";
  }
  const webName = params.websiteResult?.identity?.businessName || params.websiteResult?.identity?.pageTitle;
  const mapsName = params.googleCandidate?.businessName || params.candidate?.businessName?.value?.displayName;
  const metaName = params.metaCandidate?.businessName;
  let businessName = webName || mapsName || metaName || "";
  let nameState = "UNKNOWN";
  const nameSources = [];
  if (webName) nameSources.push("WEBSITE");
  if (mapsName) nameSources.push("GOOGLE_MAPS");
  if (metaName) nameSources.push("META");
  if (nameSources.length >= 2) {
    const normWeb = normalizeForComparison(webName);
    const normMaps = normalizeForComparison(mapsName);
    const normMeta = normalizeForComparison(metaName);
    const matches = normWeb && normMaps && (normWeb.includes(normMaps) || normMaps.includes(normWeb)) || normWeb && normMeta && (normWeb.includes(normMeta) || normMeta.includes(normWeb)) || normMaps && normMeta && (normMaps.includes(normMeta) || normMeta.includes(normMaps));
    if (matches) {
      nameState = "CORROBORATED";
      corroborationDetails.push({
        signal: "canonicalBusinessName",
        sources: nameSources,
        note: `Business name corroborated across ${nameSources.join(" and ")}`
      });
    } else {
      nameState = "CONTRADICTORY";
      conflicts.push({
        signal: "canonicalBusinessName",
        sources: nameSources.map(String),
        values: [webName, mapsName, metaName].filter(Boolean),
        note: "Contradictory business names observed across sources without matching alias"
      });
    }
  } else if (nameSources.length === 1) {
    nameState = "OBSERVED";
  } else {
    nameState = "NOT_FOUND";
  }
  const canonicalBusinessName = createSignal(
    businessName,
    nameState,
    nameSources[0] || "WEBSITE",
    rootProvenance,
    observedAt,
    params.websiteResult?.identity?.canonicalUrl,
    { corroborationSources: nameSources }
  );
  const webDomain = params.websiteResult?.identity?.domain;
  const candDomain = params.candidate?.websiteUrl?.value?.canonicalDomain || params.candidate?.websiteUrl?.value?.hostname || params.candidate?.website?.value?.domain;
  const domainVal = webDomain || candDomain || "";
  let domainState = "UNKNOWN";
  const domainSources = [];
  if (webDomain) domainSources.push("WEBSITE");
  if (candDomain) domainSources.push(params.candidate?.overallProvenance === "GOOGLE_DERIVED" ? "GOOGLE_MAPS" : "META");
  if (domainVal) {
    if (webDomain && candDomain && webDomain.toLowerCase() === candDomain.toLowerCase()) {
      domainState = "CORROBORATED";
      corroborationDetails.push({
        signal: "verifiedDomain",
        sources: domainSources,
        note: `Domain corroborated between website and listing: ${domainVal}`
      });
    } else {
      domainState = params.websiteResult?.identity ? "CONFIRMED" : "OBSERVED";
    }
  } else {
    domainState = "NOT_FOUND";
  }
  const verifiedDomain = createSignal(
    domainVal,
    domainState,
    domainSources[0] || "WEBSITE",
    rootProvenance,
    observedAt,
    params.websiteResult?.identity?.canonicalUrl
  );
  const primaryCat = params.candidate?.categories?.[0]?.value?.normalizedCategory || params.googleCandidate?.categories?.[0] || params.websiteResult?.identity?.categories?.[0] || "";
  const primaryCategory = createSignal(
    primaryCat,
    primaryCat ? "OBSERVED" : "NOT_FOUND",
    params.googleCandidate ? "GOOGLE_MAPS" : "WEBSITE",
    rootProvenance,
    observedAt
  );
  const secCats = [
    ...params.candidate?.categories?.slice(1).map((c) => c.value?.normalizedCategory).filter(Boolean) || [],
    ...params.googleCandidate?.categories?.slice(1) || [],
    ...params.websiteResult?.identity?.categories?.slice(1) || []
  ];
  const secondaryCategories = createSignal(
    secCats,
    secCats.length > 0 ? "OBSERVED" : "NOT_FOUND",
    params.googleCandidate ? "GOOGLE_MAPS" : "WEBSITE",
    rootProvenance,
    observedAt
  );
  const businessStatus = createSignal(
    "OPERATIONAL",
    "CONFIRMED",
    "WEBSITE",
    rootProvenance,
    observedAt
  );
  const webAddr = params.websiteResult?.address?.normalizedAddress || params.websiteResult?.address?.rawAddress || params.websiteResult?.identity?.address;
  const mapsAddr = params.googleCandidate?.address || params.candidate?.address?.value?.displayAddress || params.candidate?.address?.value?.normalizedAddress;
  let addressVal = webAddr || mapsAddr || "";
  let addressState = "UNKNOWN";
  if (webAddr && mapsAddr) {
    const normW = normalizeForComparison(webAddr);
    const normM = normalizeForComparison(mapsAddr);
    if (normW === normM || normW.includes(normM) || normM.includes(normW)) {
      addressState = "CORROBORATED";
      corroborationDetails.push({
        signal: "address",
        sources: ["WEBSITE", "GOOGLE_MAPS"],
        note: "Physical street address corroborated between Google Maps and website"
      });
    } else {
      addressState = "CONTRADICTORY";
      conflicts.push({
        signal: "address",
        sources: ["WEBSITE", "GOOGLE_MAPS"],
        values: [webAddr, mapsAddr],
        note: "Address mismatch between website and Maps listing"
      });
    }
  } else if (webAddr || mapsAddr) {
    addressState = "OBSERVED";
  } else {
    addressState = "NOT_FOUND";
  }
  const address = createSignal(
    addressVal,
    addressState,
    webAddr ? "WEBSITE" : "GOOGLE_MAPS",
    rootProvenance,
    observedAt
  );
  const cityVal = params.websiteResult?.address?.city || params.candidate?.address?.value?.locality || "";
  const city = createSignal(cityVal, cityVal ? "OBSERVED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const regionVal = params.websiteResult?.address?.region || params.candidate?.address?.value?.region || "";
  const region = createSignal(regionVal, regionVal ? "OBSERVED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const countryVal = params.websiteResult?.address?.country || params.candidate?.address?.value?.countryCode || "US";
  const country = createSignal(countryVal, countryVal ? "OBSERVED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const sAreas = params.websiteResult?.identity?.serviceAreas || [];
  const serviceAreas = createSignal(sAreas, sAreas.length > 0 ? "OBSERVED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const geoConfidence = createSignal(
    addressState === "CORROBORATED" ? "HIGH" : addressVal ? "MEDIUM" : "UNKNOWN",
    addressVal ? "OBSERVED" : "UNKNOWN",
    "WEBSITE",
    rootProvenance,
    observedAt
  );
  const rawServices = params.websiteResult?.services || [];
  const publishedServicesList = rawServices.map((s) => s.name).filter(Boolean);
  const publishedServices = createSignal(
    publishedServicesList,
    publishedServicesList.length > 0 ? "OBSERVED" : "NOT_FOUND",
    "WEBSITE",
    rootProvenance,
    observedAt
  );
  const descVal = params.websiteResult?.description?.text || params.websiteResult?.identity?.metaDescription || "";
  const businessDescription = createSignal(
    descVal,
    descVal ? "OBSERVED" : "NOT_FOUND",
    "WEBSITE",
    rootProvenance,
    observedAt
  );
  const hoursVal = params.websiteResult?.businessHours || params.websiteResult?.identity?.businessHours || "";
  const businessHours = createSignal(
    hoursVal,
    hoursVal ? "OBSERVED" : "NOT_FOUND",
    "WEBSITE",
    rootProvenance,
    observedAt
  );
  const contactAvailability = createSignal(
    (params.contactResult?.contacts?.length || 0) > 0 ? "AVAILABLE" : "LIMITED",
    "OBSERVED",
    "WEBSITE",
    rootProvenance,
    observedAt
  );
  const hasSite = Boolean(params.websiteResult?.identity?.canonicalUrl || params.candidate?.websiteUrl?.value?.originalUrl || params.candidate?.websiteUrl?.value?.normalizedUrl || params.candidate?.website?.value?.domain);
  const websitePresent = createSignal(hasSite, hasSite ? "CONFIRMED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const isVerifiedSite = Boolean(params.websiteResult && params.websiteResult.identity.domain);
  const verifiedWebsite = createSignal(isVerifiedSite, isVerifiedSite ? "CONFIRMED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const socialPlatforms = (params.websiteResult?.socialProfiles || []).map((s) => s.platform);
  const socialPresence = createSignal(
    socialPlatforms,
    socialPlatforms.length > 0 ? "OBSERVED" : "NOT_FOUND",
    "WEBSITE",
    rootProvenance,
    observedAt
  );
  const tech = params.websiteResult?.technologySignals || [];
  const hasBooking = tech.some((t) => t.category === "BOOKING");
  const bookingSystemPresent = createSignal(hasBooking, hasBooking ? "OBSERVED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const hasEcommerce = tech.some((t) => t.category === "ECOMMERCE");
  const ecommercePresent = createSignal(hasEcommerce, hasEcommerce ? "OBSERVED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const hasChat = tech.some((t) => t.category === "CHAT_WIDGET");
  const chatPresent = createSignal(hasChat, hasChat ? "OBSERVED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const hasAnalytics = tech.some((t) => t.category === "ANALYTICS" || t.category === "TAG_MANAGER");
  const analyticsTechnologyPresent = createSignal(hasAnalytics, hasAnalytics ? "OBSERVED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const cmsTech = tech.find((t) => t.category === "CMS");
  const cmsDetected = createSignal(cmsTech?.name || "", cmsTech ? "OBSERVED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const hasForm = (params.contactResult?.contacts || []).some((c) => c.contactType === "CONTACT_FORM") || (params.websiteResult?.contactForms || []).length > 0;
  const contactFormPresent = createSignal(hasForm, hasForm ? "OBSERVED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const contacts = params.contactResult?.contacts || [];
  const people = params.contactResult?.people || [];
  const emails = contacts.filter((c) => c.contactType === "EMAIL");
  const phones = contacts.filter((c) => c.contactType === "PHONE");
  const publicEmailPresent = createSignal(emails.length > 0, emails.length > 0 ? "CONFIRMED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const roleEmailPresent = createSignal(emails.some((e) => e.emailClassification === "ROLE_ACCOUNT"), emails.some((e) => e.emailClassification === "ROLE_ACCOUNT") ? "CONFIRMED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const personEmailPresent = createSignal(emails.some((e) => e.emailClassification === "PERSON_NAMED" || e.associatedPersonId), emails.some((e) => e.emailClassification === "PERSON_NAMED" || e.associatedPersonId) ? "CONFIRMED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const mapsPhone = params.googleCandidate?.phone || params.candidate?.phones?.[0]?.value?.e164Format || params.candidate?.phones?.[0]?.value?.rawPhone;
  const webPhone = phones[0]?.normalizedValue;
  let phoneState = phones.length > 0 ? "CONFIRMED" : "NOT_FOUND";
  if (mapsPhone && webPhone) {
    if (normalizePhoneDigits(mapsPhone) === normalizePhoneDigits(webPhone)) {
      phoneState = "CORROBORATED";
      corroborationDetails.push({
        signal: "publicPhonePresent",
        sources: ["GOOGLE_MAPS", "WEBSITE"],
        note: `Phone number corroborated across Maps and Website: ${webPhone}`
      });
    } else {
      conflicts.push({
        signal: "publicPhonePresent",
        sources: ["GOOGLE_MAPS", "WEBSITE"],
        values: [mapsPhone, webPhone],
        note: "Phone number mismatch between Maps listing and Website"
      });
    }
  }
  const publicPhonePresent = createSignal(phones.length > 0, phoneState, "WEBSITE", rootProvenance, observedAt);
  const personPhonePresent = createSignal(phones.some((p) => p.associatedPersonId), phones.some((p) => p.associatedPersonId) ? "CONFIRMED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const publicPersonPresent = createSignal(people.length > 0, people.length > 0 ? "CONFIRMED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const personWithTitlePresent = createSignal(people.some((p) => p.jobTitle || p.roleCategory), people.some((p) => p.jobTitle || p.roleCategory) ? "CONFIRMED" : "NOT_FOUND", "WEBSITE", rootProvenance, observedAt);
  const hasMeta = Boolean(params.metaCandidate && (params.metaCandidate.adCount || 0) > 0);
  const metaObservedAt = params.metaCandidate?.observedAt || observedAt;
  const metaFreshness = evaluateTemporalFreshness(metaObservedAt, maxAgeDays);
  const hasMetaAds = createSignal(
    hasMeta,
    hasMeta ? "OBSERVED" : "NOT_FOUND",
    "META",
    "META_DERIVED",
    metaObservedAt,
    params.metaCandidate?.pageUrl,
    { freshnessState: metaFreshness }
  );
  const adCount = createSignal(
    params.metaCandidate?.adCount || 0,
    hasMeta ? "OBSERVED" : "NOT_FOUND",
    "META",
    "META_DERIVED",
    metaObservedAt,
    void 0,
    { freshnessState: metaFreshness }
  );
  const adStatus = createSignal(
    params.metaCandidate?.adStatus || (hasMeta ? "ACTIVE" : "NOT_FOUND"),
    hasMeta ? "OBSERVED" : "NOT_FOUND",
    "META",
    "META_DERIVED",
    metaObservedAt,
    void 0,
    { freshnessState: metaFreshness }
  );
  const adPlatforms = createSignal(
    params.metaCandidate?.adPlatforms || [],
    hasMeta ? "OBSERVED" : "NOT_FOUND",
    "META",
    "META_DERIVED",
    metaObservedAt,
    void 0,
    { freshnessState: metaFreshness }
  );
  const identityFields = [canonicalBusinessName.value, verifiedDomain.value, primaryCategory.value];
  const identityCompleteness = identityFields.filter(Boolean).length / identityFields.length;
  const locationFields = [address.value, city.value, country.value];
  const locationCompleteness = locationFields.filter(Boolean).length / locationFields.length;
  const websiteFields = [verifiedWebsite.value, publishedServicesList.length > 0, descVal, hoursVal];
  const websiteCompleteness = websiteFields.filter(Boolean).length / websiteFields.length;
  const contactCompleteness = params.contactResult?.completeness?.contactCompletenessRatio ?? [emails.length > 0, phones.length > 0, socialPlatforms.length > 0, hasForm].filter(Boolean).length / 4;
  const publicPersonCompleteness = [
    people.length > 0,
    people.some((p) => p.jobTitle || p.roleCategory),
    people.some((p) => (p.emailRefs?.length ?? 0) > 0 || (p.phoneRefs?.length ?? 0) > 0)
  ].filter(Boolean).length / 3;
  const socialPresenceCompleteness = Math.min(socialPlatforms.length / 3, 1);
  const keySignals = [
    canonicalBusinessName.state,
    verifiedDomain.state,
    address.state,
    publishedServices.state,
    publicEmailPresent.state,
    publicPhonePresent.state,
    publicPersonPresent.state,
    socialPresence.state
  ];
  const coveredSignalsCount = keySignals.filter((s) => s === "CONFIRMED" || s === "OBSERVED" || s === "CORROBORATED").length;
  const evidenceCoverage = coveredSignalsCount / keySignals.length;
  const businessCompleteness = identityCompleteness * 0.25 + locationCompleteness * 0.2 + websiteCompleteness * 0.2 + contactCompleteness * 0.2 + publicPersonCompleteness * 0.15;
  const completeness = {
    evidenceCoverage,
    identityCompleteness,
    locationCompleteness,
    websiteCompleteness,
    contactCompleteness,
    publicPersonCompleteness,
    socialPresenceCompleteness,
    businessCompleteness,
    sourceCorroborationCount: corroborationDetails.length,
    contradictionCount: conflicts.length,
    unknownCriterionCount: keySignals.filter((s) => s === "UNKNOWN" || s === "NOT_FOUND").length
  };
  return {
    identity: {
      canonicalBusinessName,
      verifiedDomain,
      businessStatus,
      primaryCategory,
      secondaryCategories
    },
    location: {
      address,
      city,
      region,
      country,
      serviceAreas,
      geographicConfidence: geoConfidence
    },
    businessActivity: {
      publishedServices,
      businessDescription,
      businessHours,
      contactAvailability
    },
    digitalPresence: {
      websitePresent,
      verifiedWebsite,
      socialPresence,
      contactFormPresent,
      bookingSystemPresent,
      ecommercePresent,
      chatPresent,
      analyticsTechnologyPresent,
      cmsDetected
    },
    contactPresence: {
      publicEmailPresent,
      roleEmailPresent,
      personEmailPresent,
      publicPhonePresent,
      personPhonePresent,
      publicPersonPresent,
      personWithTitlePresent
    },
    advertisingSignals: {
      hasMetaAds,
      adCount,
      adStatus,
      adPlatforms,
      adPresenceState: hasMetaAds
    },
    completeness,
    completenessMetrics: completeness,
    corroboration: {
      identityCorroborated: nameState === "CORROBORATED",
      phoneCorroborated: phoneState === "CORROBORATED",
      domainCorroborated: domainState === "CORROBORATED",
      details: corroborationDetails
    },
    crossSourceCorroborations: corroborationDetails,
    conflicts,
    provenance: rootProvenance,
    sourceContributions: [
      canonicalBusinessName.sourceContributions[0],
      verifiedDomain.sourceContributions[0]
    ],
    derivedFrom: [
      params.candidate?.candidateId,
      params.websiteResult?.identity?.canonicalUrl,
      params.googleCandidate?.placeId,
      params.metaCandidate?.pageUrl
    ].filter(Boolean),
    hasRestrictedGoogleEvidence: isGoogleRestricted,
    sourceRestrictions: {
      isRestricted: isGoogleRestricted,
      restrictionBasis: isGoogleRestricted ? "GOOGLE_CONSUMER_WEB_RESTRICTED" : "NONE",
      policyStatus: isGoogleRestricted ? "POLICY_REVIEW_REQUIRED" : "POLICY_APPROVED",
      persistenceEligibility: isGoogleRestricted ? "NOT_PERSISTABLE" : "PERSISTABLE",
      exportEligibility: isGoogleRestricted ? "NOT_EXPORTABLE" : "EXPORTABLE"
    },
    observedAt
  };
}

// src/extension/acquisition/engine/searchUnit.ts
function hashStringDeterministic(input) {
  let h1 = 2166136261;
  let h2 = 2166136261;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = (h1 ^ c) * 16777619;
    h2 = (h2 ^ c >> 1) * 16777619;
    h1 = h1 >>> 0;
    h2 = h2 >>> 0;
  }
  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}
function normalizeKeyword(raw) {
  if (!raw || typeof raw !== "string") {
    throw new Error("Keyword must be a non-empty string");
  }
  const cleaned = raw.replace(/[\x00-\x1F\x7F]/g, " ").replace(/\s+/g, " ").trim();
  if (cleaned.length === 0) {
    throw new Error("Keyword cannot be empty or pure whitespace");
  }
  return cleaned;
}
function normalizeLocation(raw) {
  if (!raw || typeof raw !== "string") return void 0;
  const cleaned = raw.replace(/[\x00-\x1F\x7F]/g, " ").replace(/\s+/g, " ").trim();
  return cleaned.length > 0 ? cleaned : void 0;
}
function deriveSearchUnitId(normKeyword, normLocation) {
  const composite = `${normKeyword.toLowerCase()}::${(normLocation || "").toLowerCase()}`;
  const hash = hashStringDeterministic(composite);
  return `gsu_${hash}`;
}
function buildMapsSearchUrl(query) {
  const bounded = (query || "").slice(0, 500);
  return `https://www.google.com/maps/search/${encodeURIComponent(bounded)}`;
}
function createSearchUnit(input) {
  const normKeyword = normalizeKeyword(input.keyword);
  const normLocation = normalizeLocation(input.location);
  const normalizedQuery = input.customQuery ? input.customQuery.trim() : normLocation ? `${normKeyword} ${normLocation}` : normKeyword;
  const searchUnitId = deriveSearchUnitId(normKeyword, normLocation);
  const navigationUrl = buildMapsSearchUrl(normalizedQuery);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    searchUnitId,
    rawKeyword: input.keyword,
    normalizedKeyword: normKeyword,
    rawLocation: input.location,
    normalizedLocation: normLocation,
    normalizedQuery,
    navigationUrl,
    status: "PLANNED",
    createdAt: now,
    candidateCount: 0,
    retryCount: 0,
    maxRetries: input.maxRetries ?? 2,
    diagnostics: []
  };
}

// src/extension/acquisition/engine/candidateNormalizer.ts
var LEGAL_SUFFIXES2 = [
  "private limited",
  "pvt ltd",
  "pvt. ltd.",
  "pvt. ltd",
  "pvt",
  "pvt.",
  "limited",
  "ltd",
  "ltd.",
  "llc",
  "l.l.c.",
  "inc",
  "inc.",
  "incorporated",
  "corp",
  "corp.",
  "corporation",
  "co",
  "co.",
  "company",
  "plc",
  "p.l.c.",
  "gmbh",
  "enterprise",
  "enterprises"
];
var GENERIC_SHARED_DOMAINS2 = /* @__PURE__ */ new Set([
  "facebook.com",
  "web.facebook.com",
  "m.facebook.com",
  "l.facebook.com",
  "instagram.com",
  "wa.me",
  "api.whatsapp.com",
  "whatsapp.com",
  "t.me",
  "telegram.me",
  "youtube.com",
  "youtu.be",
  "linktr.ee",
  "bio.link",
  "beacons.ai",
  "campsite.bio",
  "forms.gle",
  "docs.google.com",
  "drive.google.com",
  "google.com",
  "typeform.com",
  "calendly.com",
  "bit.ly",
  "tinyurl.com",
  "ow.ly",
  "rebrand.ly",
  "t.co",
  "amazon.com",
  "amazon.co.uk",
  "amazon.in",
  "ebay.com",
  "etsy.com",
  "daraz.com.bd",
  "daraz.pk",
  "walmart.com",
  "target.com",
  "aliexpress.com",
  "alibaba.com",
  "myshopify.com",
  "shopee.com",
  "lazada.com",
  "yelp.com",
  "tripadvisor.com",
  "yellowpages.com"
]);
var REGIONAL_LOCALITY_TOKENS = [
  "dhaka",
  "chattogram",
  "chittagong",
  "sylhet",
  "rajshahi",
  "khulna",
  "barishal",
  "barisal",
  "rangpur",
  "mymensingh",
  "cumilla",
  "comilla",
  "gazipur",
  "narayanganj",
  "bogura",
  "bogra",
  "coxs bazar",
  "cox's bazar",
  "uttara",
  "gulshan",
  "banani",
  "dhanmondi",
  "mirpur",
  "motijheel",
  "mohakhali",
  "bashundhara",
  "badda",
  "mohammadpur",
  "khilgaon"
];
function normalizeBusinessNameForIdentity(rawName) {
  if (!rawName) {
    return { displayName: "", normalizedName: "", comparisonKey: "" };
  }
  const cleaned = rawName.normalize("NFKC").replace(/\s*·\s*Sponsored.*$/i, "").replace(/\s*Sponsored.*$/i, "").replace(/\s+/g, " ").trim();
  const normalizedName = cleaned.toLowerCase();
  let comp = normalizedName;
  let matchedSuffix;
  const sortedSuffixes = [...LEGAL_SUFFIXES2].sort((a, b) => b.length - a.length);
  for (const suffix of sortedSuffixes) {
    const escaped = suffix.replace(/\./g, "\\.");
    const regex = new RegExp(`(?:\\b|\\s)${escaped}\\.?$`, "i");
    if (regex.test(comp)) {
      matchedSuffix = suffix;
      comp = comp.replace(regex, "").trim();
      break;
    }
  }
  const comparisonKey = comp.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?–—]/g, " ").replace(/\s+/g, " ").trim();
  return {
    displayName: cleaned,
    normalizedName,
    comparisonKey: comparisonKey || normalizedName,
    legalSuffix: matchedSuffix
  };
}
function normalizeAddressForIdentity(rawAddress) {
  if (!rawAddress) {
    return { rawAddress: "", normalizedAddress: "", comparisonKey: "" };
  }
  const raw = rawAddress.trim();
  const normalizedAddress = raw.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
  const comparisonKey = normalizedAddress.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?–—]/g, " ").replace(/\s+/g, " ").trim();
  let locality;
  for (const loc of REGIONAL_LOCALITY_TOKENS) {
    const regex = new RegExp(`\\b${loc}\\b`, "i");
    if (regex.test(comparisonKey)) {
      locality = loc;
      break;
    }
  }
  return {
    rawAddress: raw,
    normalizedAddress,
    comparisonKey,
    locality
  };
}
function normalizePhoneForIdentity(rawPhone) {
  if (!rawPhone) {
    return { rawPhone: "", normalizedPhone: "", nationalDigits: "", isValid: false };
  }
  const raw = rawPhone.trim();
  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 15) {
    return { rawPhone: raw, normalizedPhone: raw, nationalDigits: digits, isValid: false };
  }
  let nationalDigits = digits;
  if (digits.startsWith("880") && digits.length >= 10) {
    nationalDigits = digits.slice(3);
  } else if (digits.startsWith("0") && digits.length >= 10) {
    nationalDigits = digits.slice(1);
  }
  const normalizedPhone = hasPlus ? `+${digits}` : digits;
  return {
    rawPhone: raw,
    normalizedPhone,
    nationalDigits,
    isValid: true
  };
}
function arePhonesEquivalent(phoneA, phoneB) {
  if (!phoneA || !phoneB) return false;
  const pA = normalizePhoneForIdentity(phoneA);
  const pB = normalizePhoneForIdentity(phoneB);
  if (!pA.isValid || !pB.isValid) return false;
  if (pA.normalizedPhone === pB.normalizedPhone) return true;
  if (pA.nationalDigits.length >= 8 && pA.nationalDigits === pB.nationalDigits) {
    return true;
  }
  return false;
}
function normalizeWebsiteForIdentity(rawUrl) {
  if (!rawUrl) {
    return { rawUrl: "", normalizedUrl: "", hostname: "", isGenericDomain: false, isValid: false };
  }
  const norm = normalizeWebsiteUrl(rawUrl);
  if (!norm.isValid) {
    return { rawUrl, normalizedUrl: "", hostname: "", isGenericDomain: false, isValid: false };
  }
  const hostname = norm.finalHostname.toLowerCase().replace(/^www\./, "");
  const isGenericDomain = GENERIC_SHARED_DOMAINS2.has(hostname);
  return {
    rawUrl,
    normalizedUrl: norm.finalUrl,
    hostname,
    domain: isGenericDomain ? void 0 : hostname,
    isGenericDomain,
    isValid: true
  };
}
function normalizeMapsUrlSlug(url) {
  if (!url) return void 0;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      return decodeURIComponent(placeMatch[1]).toLowerCase().replace(/\+/g, " ").trim();
    }
    const q = parsed.searchParams.get("q");
    if (q) {
      return q.toLowerCase().replace(/\+/g, " ").trim();
    }
  } catch {
    if (trimmed.includes("/maps/place/")) {
      const parts = trimmed.split("/maps/place/")[1]?.split(/[\/@?]/)[0];
      if (parts) return parts.toLowerCase().replace(/\+/g, " ").trim();
    }
  }
  return void 0;
}

// src/extension/acquisition/engine/candidateMatcher.ts
function compareCandidatesForIdentity(subjectA, subjectB) {
  const normNameA = normalizeBusinessNameForIdentity(subjectA.businessName);
  const normNameB = normalizeBusinessNameForIdentity(subjectB.businessName);
  const normAddrA = normalizeAddressForIdentity(subjectA.address);
  const normAddrB = normalizeAddressForIdentity(subjectB.address);
  const placeIdA = subjectA.placeId?.trim();
  const placeIdB = subjectB.placeId?.trim();
  const slugA = normalizeMapsUrlSlug(subjectA.mapsUrl);
  const slugB = normalizeMapsUrlSlug(subjectB.mapsUrl);
  const isPlaceIdAValid = Boolean(placeIdA && (placeIdA.startsWith("ChIJ") || placeIdA.startsWith("0x") || placeIdA.includes(":")));
  const isPlaceIdBValid = Boolean(placeIdB && (placeIdB.startsWith("ChIJ") || placeIdB.startsWith("0x") || placeIdB.includes(":")));
  if (isPlaceIdAValid && isPlaceIdBValid) {
    if (placeIdA === placeIdB) {
      if (normAddrA.locality && normAddrB.locality && normAddrA.locality !== normAddrB.locality) {
        return {
          relationship: "CONFLICT",
          confidence: 0.99,
          confidenceTier: "CONFLICT",
          method: "VISIBLE_PLACE_ID",
          evidence: [`PlaceId:${placeIdA}`, `AddrA:${normAddrA.rawAddress}`, `AddrB:${normAddrB.rawAddress}`],
          reasons: [
            `Same stable Place ID (${placeIdA}) but mutually incompatible localities: '${normAddrA.locality}' vs '${normAddrB.locality}'`
          ],
          conflictDetails: ["MATERIAL_ADDRESS_CONFLICT"]
        };
      }
      const conflictDetails = [];
      if (normNameA.comparisonKey && normNameB.comparisonKey && normNameA.comparisonKey !== normNameB.comparisonKey) {
        if (!normNameA.comparisonKey.includes(normNameB.comparisonKey) && !normNameB.comparisonKey.includes(normNameA.comparisonKey)) {
          conflictDetails.push("NAME_DIVERGENCE");
        }
      }
      return {
        relationship: "SAME",
        confidence: 0.99,
        confidenceTier: "HIGH",
        method: "VISIBLE_PLACE_ID",
        evidence: [`PlaceId:${placeIdA}`],
        reasons: [`Strong verified Google Place ID match (${placeIdA})`],
        conflictDetails: conflictDetails.length > 0 ? conflictDetails : void 0
      };
    } else {
      if (slugA && slugB && slugA.length >= 3 && slugA === slugB) {
        return {
          relationship: "CONFLICT",
          confidence: 0.85,
          confidenceTier: "CONFLICT",
          method: "VISIBLE_PLACE_ID",
          evidence: [`PlaceIdA:${placeIdA}`, `PlaceIdB:${placeIdB}`, `SharedSlug:${slugA}`],
          reasons: [`Identical Maps URL slug ('${slugA}') with conflicting Place IDs (${placeIdA} vs ${placeIdB})`],
          conflictDetails: ["PLACE_ID_MAPS_URL_CONTRADICTION"]
        };
      }
      const namesMatch2 = Boolean(
        normNameA.comparisonKey && normNameB.comparisonKey && (normNameA.comparisonKey === normNameB.comparisonKey || normNameA.comparisonKey.includes(normNameB.comparisonKey) || normNameB.comparisonKey.includes(normNameA.comparisonKey))
      );
      const hasAddrA = Boolean(normAddrA.comparisonKey && normAddrA.comparisonKey.length >= 5);
      const hasAddrB = Boolean(normAddrB.comparisonKey && normAddrB.comparisonKey.length >= 5);
      const addressesMatch = hasAddrA && hasAddrB && normAddrA.comparisonKey === normAddrB.comparisonKey;
      const localitiesDiffer = Boolean(normAddrA.locality && normAddrB.locality && normAddrA.locality !== normAddrB.locality);
      if (localitiesDiffer) {
        return {
          relationship: "DISTINCT",
          confidence: 0.95,
          confidenceTier: "HIGH",
          method: "VISIBLE_PLACE_ID",
          evidence: [`PlaceIdA:${placeIdA}`, `PlaceIdB:${placeIdB}`, `LocA:${normAddrA.locality}`, `LocB:${normAddrB.locality}`],
          reasons: [`Different Place IDs and distinct physical branches in '${normAddrA.locality}' vs '${normAddrB.locality}'`]
        };
      }
      if (hasAddrA && hasAddrB && !addressesMatch) {
        return {
          relationship: "DISTINCT",
          confidence: 0.95,
          confidenceTier: "HIGH",
          method: "VISIBLE_PLACE_ID",
          evidence: [`PlaceIdA:${placeIdA}`, `PlaceIdB:${placeIdB}`, `AddrA:${normAddrA.comparisonKey}`, `AddrB:${normAddrB.comparisonKey}`],
          reasons: [`Different Place IDs at different physical street addresses establish distinct listings`]
        };
      }
      if (namesMatch2 && addressesMatch) {
        const phoneMatch = arePhonesEquivalent(subjectA.phone, subjectB.phone);
        const webMatch = Boolean(
          subjectA.websiteUrl && subjectB.websiteUrl && normalizeWebsiteForIdentity(subjectA.websiteUrl).domain && normalizeWebsiteForIdentity(subjectA.websiteUrl).domain === normalizeWebsiteForIdentity(subjectB.websiteUrl).domain
        );
        if (phoneMatch || webMatch) {
          return {
            relationship: "POTENTIAL_DUPLICATE",
            confidence: 0.7,
            confidenceTier: "MEDIUM",
            method: "VISIBLE_PLACE_ID",
            evidence: [
              `PlaceIdA:${placeIdA}`,
              `PlaceIdB:${placeIdB}`,
              `SharedAddress:${normAddrA.comparisonKey}`,
              ...phoneMatch ? ["SharedPhone"] : [],
              ...webMatch ? ["SharedWebsite"] : []
            ],
            reasons: [
              `Contradictory Place IDs (${placeIdA} vs ${placeIdB}) for matching business name, physical address, and corroborated contact; held for review, no auto-merge`
            ],
            conflictDetails: ["DIFFERENT_PLACE_IDS_SAME_ADDRESS"]
          };
        }
        return {
          relationship: "DISTINCT",
          confidence: 0.9,
          confidenceTier: "HIGH",
          method: "VISIBLE_PLACE_ID",
          evidence: [`PlaceIdA:${placeIdA}`, `PlaceIdB:${placeIdB}`, `Addr:${normAddrA.comparisonKey}`],
          reasons: [`Different stable Place IDs (${placeIdA} vs ${placeIdB}) establish distinct listings despite generic address match`]
        };
      }
      if (namesMatch2 && (!hasAddrA || !hasAddrB)) {
        return {
          relationship: "POTENTIAL_DUPLICATE",
          confidence: 0.6,
          confidenceTier: "MEDIUM",
          method: "VISIBLE_PLACE_ID",
          evidence: [`PlaceIdA:${placeIdA}`, `PlaceIdB:${placeIdB}`, `Name:${normNameA.comparisonKey}`],
          reasons: [`Different Place IDs with matching name but uncorroborated address; held for review`]
        };
      }
      return {
        relationship: "DISTINCT",
        confidence: 0.95,
        confidenceTier: "HIGH",
        method: "VISIBLE_PLACE_ID",
        evidence: [`PlaceIdA:${placeIdA}`, `PlaceIdB:${placeIdB}`],
        reasons: [`Different stable Place IDs (${placeIdA} vs ${placeIdB}) establish distinct listings`]
      };
    }
  }
  if (slugA && slugB && slugA.length >= 3 && slugB.length >= 3) {
    if (slugA === slugB) {
      const conflictDetails = [];
      if (normNameA.comparisonKey && normNameB.comparisonKey && normNameA.comparisonKey !== normNameB.comparisonKey) {
        if (!normNameA.comparisonKey.includes(normNameB.comparisonKey) && !normNameB.comparisonKey.includes(normNameA.comparisonKey)) {
          conflictDetails.push("NAME_DIVERGENCE");
        }
      }
      return {
        relationship: "SAME",
        confidence: 0.95,
        confidenceTier: "HIGH",
        method: "MAPS_URL",
        evidence: [`MapsUrlSlug:${slugA}`],
        reasons: [`Strong verified Maps place URL slug match ('${slugA}')`],
        conflictDetails: conflictDetails.length > 0 ? conflictDetails : void 0
      };
    } else {
      if (normNameA.comparisonKey && normNameB.comparisonKey && normNameA.comparisonKey === normNameB.comparisonKey) {
        if (normAddrA.locality && normAddrB.locality && normAddrA.locality !== normAddrB.locality) {
          return {
            relationship: "DISTINCT",
            confidence: 0.92,
            confidenceTier: "HIGH",
            method: "MAPS_URL",
            evidence: [`SlugA:${slugA}`, `SlugB:${slugB}`, `LocA:${normAddrA.locality}`, `LocB:${normAddrB.locality}`],
            reasons: [
              `Same business name ('${normNameA.displayName}') with different Maps URLs and distinct branches in '${normAddrA.locality}' vs '${normAddrB.locality}'`
            ]
          };
        }
        if (normAddrA.comparisonKey && normAddrB.comparisonKey && normAddrA.comparisonKey !== normAddrB.comparisonKey) {
          return {
            relationship: "DISTINCT",
            confidence: 0.88,
            confidenceTier: "HIGH",
            method: "MAPS_URL",
            evidence: [`SlugA:${slugA}`, `SlugB:${slugB}`],
            reasons: [
              `Same business name ('${normNameA.displayName}') with different Maps URLs and distinct physical addresses`
            ]
          };
        }
        const phonesMatch = arePhonesEquivalent(subjectA.phone, subjectB.phone);
        if (phonesMatch) {
          return {
            relationship: "POTENTIAL_DUPLICATE",
            confidence: 0.65,
            confidenceTier: "MEDIUM",
            method: "NAME_PHONE",
            evidence: [`Name:${normNameA.comparisonKey}`, `Phone:${subjectA.phone}`, `SlugA:${slugA}`, `SlugB:${slugB}`],
            reasons: [
              `Matching business name and phone across different Maps URLs; held as potential duplicate without auto-merge`
            ]
          };
        }
        return {
          relationship: "POTENTIAL_DUPLICATE",
          confidence: 0.5,
          confidenceTier: "LOW",
          method: "MAPS_URL",
          evidence: [`Name:${normNameA.comparisonKey}`, `SlugA:${slugA}`, `SlugB:${slugB}`],
          reasons: [
            `Same business name with different Maps URLs and uncorroborated address; held separate for branch safety`
          ]
        };
      }
    }
  }
  const namesMatch = Boolean(
    normNameA.comparisonKey && normNameB.comparisonKey && normNameA.comparisonKey === normNameB.comparisonKey
  );
  if (namesMatch) {
    const hasAddressA = Boolean(normAddrA.comparisonKey && normAddrA.comparisonKey.length >= 5);
    const hasAddressB = Boolean(normAddrB.comparisonKey && normAddrB.comparisonKey.length >= 5);
    if (hasAddressA && hasAddressB) {
      if (normAddrA.locality && normAddrB.locality && normAddrA.locality !== normAddrB.locality) {
        return {
          relationship: "DISTINCT",
          confidence: 0.9,
          confidenceTier: "HIGH",
          method: "NAME_ADDRESS",
          evidence: [`Name:${normNameA.comparisonKey}`, `LocA:${normAddrA.locality}`, `LocB:${normAddrB.locality}`],
          reasons: [
            `Same business name in different cities/localities ('${normAddrA.locality}' vs '${normAddrB.locality}') \u2014 branch safety enforced`
          ]
        };
      }
      if (normAddrA.comparisonKey === normAddrB.comparisonKey) {
        return {
          relationship: "SAME",
          confidence: 0.85,
          confidenceTier: "HIGH",
          method: "NAME_ADDRESS",
          evidence: [`Name:${normNameA.comparisonKey}`, `Address:${normAddrA.comparisonKey}`],
          reasons: [`Normalized business name and physical address match exactly`]
        };
      }
      if (normAddrA.comparisonKey.includes(normAddrB.comparisonKey) || normAddrB.comparisonKey.includes(normAddrA.comparisonKey) || normAddrA.locality && normAddrA.locality === normAddrB.locality) {
        if (arePhonesEquivalent(subjectA.phone, subjectB.phone)) {
          return {
            relationship: "SAME",
            confidence: 0.85,
            confidenceTier: "HIGH",
            method: "NAME_ADDRESS",
            evidence: [`Name:${normNameA.comparisonKey}`, `AddressOverlap:${normAddrA.locality}`, `PhoneMatch`],
            reasons: [`Matching name, overlapping address in same locality, and matching phone`]
          };
        }
        return {
          relationship: "POTENTIAL_DUPLICATE",
          confidence: 0.65,
          confidenceTier: "MEDIUM",
          method: "NAME_ADDRESS",
          evidence: [`Name:${normNameA.comparisonKey}`, `AddrA:${normAddrA.comparisonKey}`, `AddrB:${normAddrB.comparisonKey}`],
          reasons: [`Matching name with overlapping locality/address formatting; requires confirmation`]
        };
      }
      return {
        relationship: "DISTINCT",
        confidence: 0.8,
        confidenceTier: "MEDIUM",
        method: "NAME_ADDRESS",
        evidence: [`Name:${normNameA.comparisonKey}`, `AddrA:${normAddrA.comparisonKey}`, `AddrB:${normAddrB.comparisonKey}`],
        reasons: [`Same business name at different physical addresses`]
      };
    }
    if (arePhonesEquivalent(subjectA.phone, subjectB.phone)) {
      return {
        relationship: "POTENTIAL_DUPLICATE",
        confidence: 0.7,
        confidenceTier: "MEDIUM",
        method: "NAME_PHONE",
        evidence: [`Name:${normNameA.comparisonKey}`, `Phone:${subjectA.phone}`],
        reasons: [`Matching business name and phone number; physical address uncorroborated`]
      };
    }
    const catA = (subjectA.category || "").toLowerCase().trim();
    const catB = (subjectB.category || "").toLowerCase().trim();
    const locA = (subjectA.searchLocation || "").toLowerCase().trim();
    const locB = (subjectB.searchLocation || "").toLowerCase().trim();
    if (subjectA.searchUnitId && subjectB.searchUnitId && subjectA.searchUnitId === subjectB.searchUnitId) {
      return {
        relationship: "SAME",
        confidence: locA || catA ? 0.75 : 0.6,
        confidenceTier: "MEDIUM",
        method: locA || catA ? "NAME_CATEGORY_LOCATION" : "WEAK_FALLBACK",
        evidence: [`Name:${normNameA.comparisonKey}`, `SearchUnit:${subjectA.searchUnitId}`],
        reasons: [`Matching name observed within the same SearchUnit feed`]
      };
    }
    if (catA && catB && catA === catB && locA && locB && locA === locB) {
      return {
        relationship: "POTENTIAL_DUPLICATE",
        confidence: 0.6,
        confidenceTier: "MEDIUM",
        method: "NAME_CATEGORY_LOCATION",
        evidence: [`Name:${normNameA.comparisonKey}`, `Cat:${catA}`, `Loc:${locA}`],
        reasons: [`Matching name, category, and search location across different search units; held for review`]
      };
    }
    return {
      relationship: "POTENTIAL_DUPLICATE",
      confidence: 0.4,
      confidenceTier: "LOW",
      method: "WEAK_FALLBACK",
      evidence: [`Name:${normNameA.comparisonKey}`],
      reasons: [`Name matches but lack of address/phone prevents auto-merge across SearchUnits`]
    };
  }
  if (arePhonesEquivalent(subjectA.phone, subjectB.phone)) {
    return {
      relationship: "DISTINCT",
      confidence: 0.85,
      confidenceTier: "HIGH",
      method: "NAME_PHONE",
      evidence: [`NameA:${normNameA.displayName}`, `NameB:${normNameB.displayName}`, `Phone:${subjectA.phone}`],
      reasons: [`Shared phone number alone does not establish business identity across different names`]
    };
  }
  const webA = normalizeWebsiteForIdentity(subjectA.websiteUrl);
  const webB = normalizeWebsiteForIdentity(subjectB.websiteUrl);
  if (webA.domain && webB.domain && webA.domain === webB.domain) {
    return {
      relationship: "DISTINCT",
      confidence: 0.85,
      confidenceTier: "HIGH",
      method: "MAPS_URL",
      evidence: [`NameA:${normNameA.displayName}`, `NameB:${normNameB.displayName}`, `Domain:${webA.domain}`],
      reasons: [`Shared website domain alone does not establish business identity across different names`]
    };
  }
  return {
    relationship: "DISTINCT",
    confidence: 0.95,
    confidenceTier: "HIGH",
    method: "WEAK_FALLBACK",
    evidence: [`NameA:${normNameA.displayName || "unknown"}`, `NameB:${normNameB.displayName || "unknown"}`],
    reasons: [`No compatible identity signals found; candidates represent distinct businesses`]
  };
}

// src/extension/acquisition/engine/candidateMerger.ts
var DEFAULT_EVIDENCE_BOUNDS = {
  maxObservationReferences: 50,
  maxSearchUnitContexts: 50,
  maxFieldConflicts: 20,
  maxFieldEvidencePerField: 10
};
var MAX_BOUNDED_OBSERVATIONS = DEFAULT_EVIDENCE_BOUNDS.maxObservationReferences;
var MAX_BOUNDED_SEARCH_UNITS = DEFAULT_EVIDENCE_BOUNDS.maxSearchUnitContexts;
var MAX_BOUNDED_CONFLICTS = DEFAULT_EVIDENCE_BOUNDS.maxFieldConflicts;
var MAX_BOUNDED_FIELD_EVIDENCE = DEFAULT_EVIDENCE_BOUNDS.maxFieldEvidencePerField;
var CORE_FIELD_NAMES = [
  "businessName",
  "category",
  "address",
  "phone",
  "websiteUrl",
  "rating",
  "reviewCount",
  "businessStatus",
  "mapsUrl"
];
var PRECEDENCE_SCORE = {
  PRESENT: 5,
  AMBIGUOUS: 4,
  UNKNOWN: 3,
  ABSENT: 2,
  UNSUPPORTED: 1
};
function compareTemporalObservations(metaA, metaB) {
  const timeA = metaA.observedAt ? new Date(metaA.observedAt).getTime() : 0;
  const timeB = metaB.observedAt ? new Date(metaB.observedAt).getTime() : 0;
  if (timeA !== timeB) {
    return timeA > timeB ? 1 : -1;
  }
  const idA = metaA.observationId || "";
  const idB = metaB.observationId || "";
  return idA.localeCompare(idB);
}
function mergeSingleField(existing, incoming, existingMeta, incomingMeta, isTemporalField = false) {
  const existingScore = PRECEDENCE_SCORE[existing.availability] ?? 0;
  const incomingScore = PRECEDENCE_SCORE[incoming.availability] ?? 0;
  if (incomingScore > existingScore) {
    return { merged: incoming, hasConflict: false };
  }
  if (existingScore > incomingScore) {
    if (existing.availability === "PRESENT" && incoming.availability === "ABSENT") {
      return {
        merged: existing,
        hasConflict: true,
        conflictReason: "WEBSITE_EVIDENCE_CONFLICT: incoming observation claims ABSENT while prior observation established PRESENT"
      };
    }
    return { merged: existing, hasConflict: false };
  }
  if (existing.availability === "PRESENT" && incoming.availability === "PRESENT") {
    if (isTemporalField) {
      let cmp = compareTemporalObservations(incomingMeta, existingMeta);
      if (cmp === 0) {
        const valA2 = String(existing.parsedValue ?? "");
        const valB2 = String(incoming.parsedValue ?? "");
        cmp = valB2.localeCompare(valA2);
      }
      const chosen = cmp > 0 ? incoming : existing;
      return { merged: chosen, hasConflict: false };
    }
    const valA = String(existing.parsedValue ?? existing.rawValue ?? "");
    const valB = String(incoming.parsedValue ?? incoming.rawValue ?? "");
    if (valA && valB && valA !== valB) {
      let chosen;
      if (incoming.confidence !== existing.confidence) {
        chosen = incoming.confidence > existing.confidence ? incoming : existing;
      } else {
        chosen = valB.localeCompare(valA) > 0 ? incoming : existing;
      }
      return {
        merged: chosen,
        hasConflict: true,
        conflictReason: `Conflicting PRESENT values observed: '${valA}' vs '${valB}'`
      };
    }
    return {
      merged: incoming.confidence > existing.confidence ? incoming : existing,
      hasConflict: false
    };
  }
  return {
    merged: incoming.confidence > existing.confidence ? incoming : existing,
    hasConflict: false
  };
}
function assessCandidateQuality(candidate) {
  let presentCount = 0;
  let absentCount = 0;
  let supportedCount = 0;
  let unknownCount = 0;
  const fieldStates = {};
  const issues = [];
  const conflictFieldMap = new Set(candidate.fieldConflicts.map((c) => c.fieldName));
  for (const fieldName of CORE_FIELD_NAMES) {
    const field = candidate[fieldName];
    const avail = field?.availability ?? "UNKNOWN";
    if (avail === "PRESENT") {
      presentCount++;
      supportedCount++;
      if (conflictFieldMap.has(fieldName)) {
        fieldStates[fieldName] = "CONFLICTING";
      } else {
        fieldStates[fieldName] = "CONFIDENT";
      }
    } else if (avail === "ABSENT") {
      absentCount++;
      supportedCount++;
      fieldStates[fieldName] = "SUPPORTED";
    } else if (avail === "AMBIGUOUS") {
      supportedCount++;
      fieldStates[fieldName] = "INCOMPLETE";
    } else {
      unknownCount++;
      fieldStates[fieldName] = "UNKNOWN";
    }
  }
  const knownCount = presentCount + absentCount;
  const dataCompleteness = Math.round(knownCount / CORE_FIELD_NAMES.length * 1e3) / 10;
  if (candidate.businessName.availability === "UNKNOWN") {
    issues.push({ code: "MISSING_NAME", field: "businessName", severity: "MEDIUM", message: "Business name is missing or unverified" });
  }
  if (candidate.address.availability === "UNKNOWN") {
    issues.push({ code: "MISSING_ADDRESS", field: "address", severity: "LOW", message: "Physical street address is unknown on observation surface" });
  }
  if (candidate.phone.availability === "UNKNOWN") {
    issues.push({ code: "MISSING_PHONE", field: "phone", severity: "LOW", message: "Telephone number is unknown on observation surface" });
  }
  if (candidate.websiteUrl.availability === "UNKNOWN") {
    issues.push({ code: "MISSING_WEBSITE_EVIDENCE", field: "websiteUrl", severity: "LOW", message: "Website link was not observed on card" });
  }
  if (candidate.rating.availability === "UNKNOWN") {
    issues.push({ code: "RATING_UNKNOWN", field: "rating", severity: "LOW", message: "Rating is unknown on observation surface" });
  }
  if (candidate.reviewCount.availability === "UNKNOWN") {
    issues.push({ code: "REVIEW_COUNT_UNKNOWN", field: "reviewCount", severity: "LOW", message: "Review count is unknown on observation surface" });
  }
  if (candidate.identityConfidenceTier === "LOW") {
    issues.push({ code: "IDENTITY_WEAK", severity: "LOW", message: "Candidate identified via weak fallback signal" });
  } else if (candidate.identityConfidenceTier === "CONFLICT") {
    issues.push({ code: "IDENTITY_CONFLICT", severity: "MEDIUM", message: "Candidate contains conflicting identity attributes" });
  }
  if (candidate.fieldConflicts.length >= 2) {
    issues.push({ code: "MULTI_FIELD_CONFLICT", severity: "MEDIUM", message: `Multiple fields (${candidate.fieldConflicts.length}) have conflicting evidence` });
  }
  for (const conf of candidate.fieldConflicts) {
    if (conf.fieldName === "phone") {
      issues.push({ code: "INCONSISTENT_PHONE", field: "phone", severity: "LOW", message: conf.resolutionReason });
    } else if (conf.fieldName === "address") {
      issues.push({ code: "INCONSISTENT_ADDRESS", field: "address", severity: "LOW", message: conf.resolutionReason });
    } else if (conf.fieldName === "websiteUrl") {
      issues.push({ code: "WEBSITE_EVIDENCE_CONFLICT", field: "websiteUrl", severity: "LOW", message: conf.resolutionReason });
    }
  }
  if (candidate.observationCount > 1) {
    issues.push({ code: "DUPLICATE_OBSERVATION", severity: "INFO", message: `Candidate observed ${candidate.observationCount} times across SearchUnits` });
  }
  return {
    identityConfidence: candidate.identityConfidenceTier,
    identityConfidenceScore: candidate.identityConfidenceScore,
    dataCompleteness,
    observedFieldCount: presentCount,
    supportedFieldCount: supportedCount,
    unknownFieldCount: unknownCount,
    conflictFieldCount: candidate.fieldConflicts.length,
    fieldStates,
    issues
  };
}
function createSessionCandidateFromObservation(observation, decision, assignedCandidateId, observedOrder) {
  const now = observation.observedAt || (/* @__PURE__ */ new Date()).toISOString();
  const obsRef = {
    observationId: observation.observationId,
    searchUnitId: observation.searchUnitId,
    observedAt: now,
    searchKeyword: observation.searchKeyword,
    searchLocation: observation.searchLocation,
    pageUrl: observation.pageUrl
  };
  const suContext = {
    searchUnitId: observation.searchUnitId,
    keyword: observation.searchKeyword,
    location: observation.searchLocation,
    firstObservedAt: now,
    lastObservedAt: now,
    observationCount: 1
  };
  const fieldEvidence = {};
  for (const fn of CORE_FIELD_NAMES) {
    const field = observation[fn];
    if (field) {
      fieldEvidence[fn] = [{
        value: field.parsedValue ?? field.rawValue,
        availability: field.availability,
        confidence: field.confidence,
        observedAt: now,
        searchUnitId: observation.searchUnitId,
        observationId: observation.observationId
      }];
    }
  }
  const quality = assessCandidateQuality({
    businessName: observation.businessName,
    category: observation.category,
    address: observation.address,
    phone: observation.phone,
    websiteUrl: observation.websiteUrl,
    rating: observation.rating,
    reviewCount: observation.reviewCount,
    businessStatus: observation.businessStatus,
    mapsUrl: observation.mapsUrl,
    identityConfidenceTier: decision.confidenceTier,
    identityConfidenceScore: decision.confidence,
    observationCount: 1,
    fieldConflicts: []
  });
  return {
    candidateId: assignedCandidateId,
    firstObservedAt: now,
    lastObservedAt: now,
    observationCount: 1,
    source: "GOOGLE_MAPS_BROWSER",
    isRestricted: true,
    businessName: observation.businessName,
    category: observation.category,
    address: observation.address,
    phone: observation.phone,
    websiteUrl: observation.websiteUrl,
    rating: observation.rating,
    reviewCount: observation.reviewCount,
    businessStatus: observation.businessStatus,
    placeId: observation.placeId,
    mapsUrl: observation.mapsUrl,
    fieldAvailability: { ...observation.fieldAvailability },
    identityMethod: decision.method,
    identityConfidence: decision.confidence,
    identityEvidence: decision.evidence.join(" | ") || decision.method,
    observationReferences: [obsRef],
    observedSearchUnits: [suContext],
    observedOrder,
    fieldConflicts: [],
    fieldEvidence,
    qualityMetrics: quality,
    // Projection properties for backwards compatibility
    observationId: assignedCandidateId,
    searchUnitId: observation.searchUnitId,
    sessionId: observation.sessionId,
    observedAt: now,
    pageUrl: observation.pageUrl,
    pageKind: observation.pageKind,
    searchKeyword: observation.searchKeyword,
    searchLocation: observation.searchLocation,
    provenance: observation.provenance,
    diagnostics: [...observation.diagnostics]
  };
}
function mergeObservationIntoSessionCandidate(existing, incoming, decision) {
  const now = incoming.observedAt || (/* @__PURE__ */ new Date()).toISOString();
  const newObsCount = existing.observationCount + 1;
  const newObsRef = {
    observationId: incoming.observationId,
    searchUnitId: incoming.searchUnitId,
    observedAt: now,
    searchKeyword: incoming.searchKeyword,
    searchLocation: incoming.searchLocation,
    pageUrl: incoming.pageUrl
  };
  const updatedObsRefs = [newObsRef, ...existing.observationReferences].slice(0, MAX_BOUNDED_OBSERVATIONS);
  const existingSuMap = /* @__PURE__ */ new Map();
  for (const su of existing.observedSearchUnits) {
    existingSuMap.set(su.searchUnitId, su);
  }
  const currentSu = existingSuMap.get(incoming.searchUnitId);
  if (currentSu) {
    existingSuMap.set(incoming.searchUnitId, {
      ...currentSu,
      lastObservedAt: now,
      observationCount: currentSu.observationCount + 1
    });
  } else {
    existingSuMap.set(incoming.searchUnitId, {
      searchUnitId: incoming.searchUnitId,
      keyword: incoming.searchKeyword,
      location: incoming.searchLocation,
      firstObservedAt: now,
      lastObservedAt: now,
      observationCount: 1
    });
  }
  const updatedSearchUnits = Array.from(existingSuMap.values()).slice(0, MAX_BOUNDED_SEARCH_UNITS);
  const newConflicts = [...existing.fieldConflicts];
  const updatedFieldEvidence = {};
  for (const [k, v] of Object.entries(existing.fieldEvidence)) {
    updatedFieldEvidence[k] = [...v];
  }
  function mergeAndRecord(fieldName, fieldExisting, fieldIncoming, isTemporal = false) {
    const existingEntry = existing.fieldEvidence[fieldName] && existing.fieldEvidence[fieldName].length > 0 ? existing.fieldEvidence[fieldName][0] : void 0;
    const existingMeta = {
      observedAt: existingEntry?.observedAt || existing.lastObservedAt,
      observationId: existingEntry?.observationId || existing.observationId
    };
    const incomingMeta = {
      observedAt: incoming.observedAt || now,
      observationId: incoming.observationId
    };
    const res = mergeSingleField(fieldExisting, fieldIncoming, existingMeta, incomingMeta, isTemporal);
    const entries = [...updatedFieldEvidence[fieldName] || []];
    if (fieldIncoming.parsedValue !== void 0 || fieldIncoming.rawValue) {
      entries.push({
        value: fieldIncoming.parsedValue ?? fieldIncoming.rawValue,
        availability: fieldIncoming.availability,
        confidence: fieldIncoming.confidence,
        observedAt: incomingMeta.observedAt,
        searchUnitId: incoming.searchUnitId,
        observationId: incoming.observationId
      });
      entries.sort((a, b) => compareTemporalObservations(b, a));
      updatedFieldEvidence[fieldName] = entries.slice(0, MAX_BOUNDED_FIELD_EVIDENCE);
    }
    if (res.hasConflict && res.conflictReason) {
      const existingConflictIdx = newConflicts.findIndex((c) => c.fieldName === fieldName);
      const conflictValues = [
        {
          value: fieldExisting.parsedValue ?? fieldExisting.rawValue,
          availability: fieldExisting.availability,
          observedAt: existingMeta.observedAt,
          searchUnitId: existing.searchUnitId,
          observationId: existingMeta.observationId
        },
        {
          value: fieldIncoming.parsedValue ?? fieldIncoming.rawValue,
          availability: fieldIncoming.availability,
          observedAt: incomingMeta.observedAt,
          searchUnitId: incoming.searchUnitId,
          observationId: incomingMeta.observationId
        }
      ].sort((a, b) => String(a.value).localeCompare(String(b.value)));
      const conflictObj = {
        fieldName,
        values: conflictValues,
        selectedValue: res.merged.parsedValue ?? res.merged.rawValue,
        resolutionReason: res.conflictReason
      };
      if (existingConflictIdx >= 0) {
        newConflicts[existingConflictIdx] = conflictObj;
      } else {
        newConflicts.push(conflictObj);
      }
      newConflicts.sort((a, b) => a.fieldName.localeCompare(b.fieldName));
    }
    return res.merged;
  }
  const mergedName = mergeAndRecord("businessName", existing.businessName, incoming.businessName);
  const mergedCategory = mergeAndRecord("category", existing.category, incoming.category);
  const mergedAddress = mergeAndRecord("address", existing.address, incoming.address);
  const mergedPhone = mergeAndRecord("phone", existing.phone, incoming.phone);
  const mergedWebsite = mergeAndRecord("websiteUrl", existing.websiteUrl, incoming.websiteUrl);
  const mergedRating = mergeAndRecord("rating", existing.rating, incoming.rating, true);
  const mergedReviews = mergeAndRecord("reviewCount", existing.reviewCount, incoming.reviewCount, true);
  const mergedStatus = mergeAndRecord("businessStatus", existing.businessStatus, incoming.businessStatus, true);
  const mergedPlaceId = mergeAndRecord("placeId", existing.placeId, incoming.placeId);
  const mergedMapsUrl = mergeAndRecord("mapsUrl", existing.mapsUrl, incoming.mapsUrl);
  const fieldAvailability = {
    businessName: mergedName.availability,
    category: mergedCategory.availability,
    address: mergedAddress.availability,
    phone: mergedPhone.availability,
    websiteUrl: mergedWebsite.availability,
    rating: mergedRating.availability,
    reviewCount: mergedReviews.availability,
    businessStatus: mergedStatus.availability,
    placeId: mergedPlaceId.availability,
    mapsUrl: mergedMapsUrl.availability
  };
  const boundedConflicts = newConflicts.slice(0, MAX_BOUNDED_CONFLICTS);
  const quality = assessCandidateQuality({
    businessName: mergedName,
    category: mergedCategory,
    address: mergedAddress,
    phone: mergedPhone,
    websiteUrl: mergedWebsite,
    rating: mergedRating,
    reviewCount: mergedReviews,
    businessStatus: mergedStatus,
    mapsUrl: mergedMapsUrl,
    identityConfidenceTier: decision.confidenceTier === "CONFLICT" ? "CONFLICT" : existing.qualityMetrics.identityConfidence,
    identityConfidenceScore: Math.max(existing.identityConfidence, decision.confidence),
    observationCount: newObsCount,
    fieldConflicts: boundedConflicts
  });
  const incomingTime = new Date(now).getTime();
  const existingFirstTime = new Date(existing.firstObservedAt).getTime();
  const existingLastTime = new Date(existing.lastObservedAt).getTime();
  const computedFirstObservedAt = incomingTime < existingFirstTime ? now : existing.firstObservedAt;
  const computedLastObservedAt = incomingTime > existingLastTime ? now : existing.lastObservedAt;
  const isTruncated = Boolean(
    existing.evidenceTruncated || newObsCount > MAX_BOUNDED_OBSERVATIONS || updatedSearchUnits.length >= MAX_BOUNDED_SEARCH_UNITS
  );
  return {
    ...existing,
    firstObservedAt: computedFirstObservedAt,
    lastObservedAt: computedLastObservedAt,
    observationCount: newObsCount,
    evidenceTruncated: isTruncated,
    businessName: mergedName,
    category: mergedCategory,
    address: mergedAddress,
    phone: mergedPhone,
    websiteUrl: mergedWebsite,
    rating: mergedRating,
    reviewCount: mergedReviews,
    businessStatus: mergedStatus,
    placeId: mergedPlaceId,
    mapsUrl: mergedMapsUrl,
    fieldAvailability,
    observationReferences: updatedObsRefs,
    observedSearchUnits: updatedSearchUnits,
    fieldConflicts: boundedConflicts,
    fieldEvidence: updatedFieldEvidence,
    qualityMetrics: quality,
    observedAt: computedLastObservedAt
  };
}

// src/extension/acquisition/engine/candidateRegistry.ts
var CandidateRegistry = class {
  constructor(sessionId = "") {
    this._candidates = /* @__PURE__ */ new Map();
    this._candidateOrder = [];
    // Multi-key blocking indexes (mapping normalized keys -> candidate IDs)
    this._byPlaceId = /* @__PURE__ */ new Map();
    this._byMapsUrlSlug = /* @__PURE__ */ new Map();
    this._byNameAddressKey = /* @__PURE__ */ new Map();
    this._byNameKey = /* @__PURE__ */ new Map();
    this._byPhoneKey = /* @__PURE__ */ new Map();
    this._byDomainKey = /* @__PURE__ */ new Map();
    // Relationship tracking
    this._potentialDuplicates = /* @__PURE__ */ new Map();
    this._identityConflicts = /* @__PURE__ */ new Map();
    this._rawObservations = 0;
    this._duplicateObservations = 0;
    this._sessionId = sessionId;
  }
  get sessionId() {
    return this._sessionId;
  }
  get size() {
    return this._candidates.size;
  }
  get knownCandidateIds() {
    return this._candidateOrder;
  }
  has(candidateId) {
    return this._candidates.has(candidateId);
  }
  get(candidateId) {
    return this._candidates.get(candidateId);
  }
  getAll() {
    return Array.from(this._candidates.values());
  }
  getAllCandidates() {
    return this.getAll();
  }
  updateCandidate(candidate) {
    if (this._candidates.has(candidate.candidateId)) {
      this._candidates.set(candidate.candidateId, candidate);
      this._updateIndexes(candidate);
    }
  }
  getEnrichedCount() {
    let count = 0;
    for (const c of this._candidates.values()) {
      if (c.enrichmentStatus === "COMPLETED" || c.enrichmentStatus === "PARTIAL") {
        count++;
      }
    }
    return count;
  }
  getPotentialDuplicates() {
    return Array.from(this._potentialDuplicates.values());
  }
  getIdentityConflicts() {
    return Array.from(this._identityConflicts.values());
  }
  getStats() {
    return {
      uniqueCandidates: this._candidates.size,
      duplicateObservations: this._duplicateObservations,
      rawObservations: this._rawObservations,
      potentialDuplicates: this._potentialDuplicates.size,
      identityConflicts: this._identityConflicts.size
    };
  }
  /**
   * Registers a newly observed Google Maps candidate observation.
   * Performs incremental indexed blocking, equivalence testing, auto-merge or distinct registration.
   */
  registerObservation(observation) {
    this._rawObservations++;
    const rawName = observation.businessName?.parsedValue ?? observation.businessName?.rawValue;
    const rawAddr = observation.address?.parsedValue ?? observation.address?.rawValue;
    const rawPhone = observation.phone?.parsedValue ?? observation.phone?.rawValue;
    const rawWeb = observation.websiteUrl?.parsedValue ?? observation.websiteUrl?.rawValue;
    const rawPlaceId = observation.placeId?.parsedValue ?? observation.placeId?.rawValue;
    const rawMapsUrl = observation.mapsUrl?.parsedValue ?? observation.mapsUrl?.rawValue;
    const normName = normalizeBusinessNameForIdentity(rawName);
    const normAddr = normalizeAddressForIdentity(rawAddr);
    const normPhone = normalizePhoneForIdentity(rawPhone);
    const normWeb = normalizeWebsiteForIdentity(rawWeb);
    const mapsSlug = normalizeMapsUrlSlug(rawMapsUrl);
    const placeId = rawPlaceId?.trim();
    const isPlaceIdValid = Boolean(placeId && (placeId.startsWith("ChIJ") || placeId.startsWith("0x") || placeId.includes(":")));
    const candidateIdSet = /* @__PURE__ */ new Set();
    if (isPlaceIdValid && placeId) {
      const matchId = this._byPlaceId.get(placeId);
      if (matchId) candidateIdSet.add(matchId);
    }
    if (mapsSlug && mapsSlug.length >= 3) {
      const matchId = this._byMapsUrlSlug.get(mapsSlug);
      if (matchId) candidateIdSet.add(matchId);
    }
    if (normName.comparisonKey && normAddr.comparisonKey && normAddr.comparisonKey.length >= 5) {
      const nameAddrKey = `${normName.comparisonKey}::${normAddr.comparisonKey}`;
      const matchId = this._byNameAddressKey.get(nameAddrKey);
      if (matchId) candidateIdSet.add(matchId);
    }
    if (normName.comparisonKey) {
      const nameMatches = this._byNameKey.get(normName.comparisonKey);
      if (nameMatches) {
        for (const cid of nameMatches) candidateIdSet.add(cid);
      }
    }
    if (normPhone.isValid && normPhone.nationalDigits.length >= 8) {
      const phoneMatches = this._byPhoneKey.get(normPhone.nationalDigits);
      if (phoneMatches) {
        for (const cid of phoneMatches) candidateIdSet.add(cid);
      }
    }
    if (normWeb.domain) {
      const domainMatches = this._byDomainKey.get(normWeb.domain);
      if (domainMatches) {
        for (const cid of domainMatches) candidateIdSet.add(cid);
      }
    }
    const incomingSubject = {
      observationId: observation.observationId,
      businessName: rawName,
      placeId: isPlaceIdValid ? placeId : void 0,
      mapsUrl: rawMapsUrl,
      address: rawAddr,
      phone: rawPhone,
      websiteUrl: rawWeb,
      category: observation.category?.parsedValue ?? observation.category?.rawValue,
      searchLocation: observation.searchLocation,
      searchKeyword: observation.searchKeyword,
      searchUnitId: observation.searchUnitId
    };
    const derivedCandidateId = (observation.candidateId?.startsWith("cid_") ? observation.candidateId : void 0) || (observation.observationId?.startsWith("cid_") ? observation.observationId : void 0) || this._deriveDeterministicCandidateId(
      isPlaceIdValid ? placeId : void 0,
      mapsSlug,
      normName.comparisonKey,
      normAddr.comparisonKey,
      observation.category?.parsedValue ?? observation.category?.rawValue,
      observation.searchLocation,
      observation.searchUnitId
    );
    if (derivedCandidateId) {
      candidateIdSet.add(derivedCandidateId);
    }
    const placeholder = this._candidates.get(derivedCandidateId);
    if (placeholder && !placeholder.businessName) {
      const orderIdx = this._candidateOrder.indexOf(derivedCandidateId);
      const restored = createSessionCandidateFromObservation(
        observation,
        {
          relationship: "SAME",
          confidence: isPlaceIdValid ? 0.99 : mapsSlug ? 0.95 : 0.85,
          confidenceTier: "HIGH",
          method: isPlaceIdValid ? "VISIBLE_PLACE_ID" : mapsSlug ? "MAPS_URL" : "NAME_ADDRESS",
          evidence: [rawName || "restored"],
          reasons: ["Restored checkpoint identity matching incoming observation"]
        },
        derivedCandidateId,
        orderIdx >= 0 ? orderIdx + 1 : this._candidateOrder.length + 1
      );
      this._candidates.set(derivedCandidateId, restored);
      this._updateIndexes(restored);
      return {
        isNew: false,
        candidate: restored,
        candidateId: derivedCandidateId,
        decision: {
          relationship: "SAME",
          confidence: 0.95,
          confidenceTier: "HIGH",
          method: isPlaceIdValid ? "VISIBLE_PLACE_ID" : mapsSlug ? "MAPS_URL" : "NAME_ADDRESS",
          evidence: ["Checkpoint restoration"],
          reasons: ["Observation matches checkpoint identity"]
        }
      };
    }
    let confirmedSameCandidate;
    let strongestDecision;
    for (const cid of candidateIdSet) {
      const existing = this._candidates.get(cid);
      if (!existing || !existing.businessName) continue;
      const existingSubject = {
        candidateId: existing.candidateId,
        businessName: existing.businessName?.parsedValue ?? existing.businessName?.rawValue,
        placeId: existing.placeId?.parsedValue ?? existing.placeId?.rawValue,
        mapsUrl: existing.mapsUrl?.parsedValue ?? existing.mapsUrl?.rawValue,
        address: existing.address?.parsedValue ?? existing.address?.rawValue,
        phone: existing.phone?.parsedValue ?? existing.phone?.rawValue,
        websiteUrl: existing.websiteUrl?.parsedValue ?? existing.websiteUrl?.rawValue,
        category: existing.category?.parsedValue ?? existing.category?.rawValue,
        searchLocation: existing.searchLocation,
        searchKeyword: existing.searchKeyword,
        searchUnitId: existing.searchUnitId
      };
      const decision = compareCandidatesForIdentity(existingSubject, incomingSubject);
      if (decision.relationship === "SAME") {
        confirmedSameCandidate = existing;
        strongestDecision = decision;
        break;
      } else if (decision.relationship === "POTENTIAL_DUPLICATE") {
        const pairKey = [existing.candidateId, observation.observationId].sort().join("::");
        this._potentialDuplicates.set(pairKey, {
          candidateIdA: existing.candidateId,
          candidateIdB: observation.observationId,
          relationship: "POTENTIAL_DUPLICATE",
          confidence: decision.confidence,
          method: decision.method,
          reason: decision.reasons.join("; "),
          detectedAt: (/* @__PURE__ */ new Date()).toISOString(),
          evidence: decision.evidence
        });
        if (!strongestDecision || decision.confidence > strongestDecision.confidence) {
          strongestDecision = decision;
        }
      } else if (decision.relationship === "CONFLICT") {
        const pairKey = [existing.candidateId, observation.observationId].sort().join("::");
        this._identityConflicts.set(pairKey, {
          candidateIdA: existing.candidateId,
          candidateIdB: observation.observationId,
          relationship: "CONFLICT",
          confidence: decision.confidence,
          method: decision.method,
          reason: decision.reasons.join("; "),
          detectedAt: (/* @__PURE__ */ new Date()).toISOString(),
          evidence: decision.evidence
        });
        if (!strongestDecision || decision.confidence > strongestDecision.confidence) {
          strongestDecision = decision;
        }
      }
    }
    if (confirmedSameCandidate && strongestDecision) {
      this._duplicateObservations++;
      const mergedCandidate = mergeObservationIntoSessionCandidate(
        confirmedSameCandidate,
        observation,
        strongestDecision
      );
      this._candidates.set(confirmedSameCandidate.candidateId, mergedCandidate);
      this._updateIndexes(mergedCandidate);
      return {
        isNew: false,
        candidate: mergedCandidate,
        candidateId: confirmedSameCandidate.candidateId,
        decision: strongestDecision
      };
    }
    const initialDecision = strongestDecision || {
      relationship: "DISTINCT",
      confidence: isPlaceIdValid ? 0.99 : mapsSlug ? 0.95 : normName.comparisonKey && normAddr.comparisonKey ? 0.85 : 0.5,
      confidenceTier: isPlaceIdValid || mapsSlug || normName.comparisonKey && normAddr.comparisonKey ? "HIGH" : "LOW",
      method: isPlaceIdValid ? "VISIBLE_PLACE_ID" : mapsSlug ? "MAPS_URL" : normName.comparisonKey && normAddr.comparisonKey ? "NAME_ADDRESS" : "WEAK_FALLBACK",
      evidence: [rawName || "unknown"],
      reasons: ["Initial candidate observation registered as unique session candidate"]
    };
    const newCandidate = createSessionCandidateFromObservation(
      observation,
      initialDecision,
      derivedCandidateId,
      this._candidateOrder.length + 1
    );
    this._candidates.set(derivedCandidateId, newCandidate);
    this._candidateOrder.push(derivedCandidateId);
    this._updateIndexes(newCandidate);
    return {
      isNew: true,
      candidate: newCandidate,
      candidateId: derivedCandidateId,
      decision: initialDecision
    };
  }
  _deriveDeterministicCandidateId(placeId, mapsSlug, normNameKey, normAddrKey, category, location, searchUnitId) {
    if (placeId && (placeId.startsWith("ChIJ") || placeId.startsWith("0x") || placeId.includes(":"))) {
      return `cid_${hashStringDeterministic(`PID::${placeId}`)}`;
    }
    if (mapsSlug && mapsSlug.length >= 3) {
      return `cid_${hashStringDeterministic(`URL::${mapsSlug}`)}`;
    }
    if (normNameKey && normAddrKey && normAddrKey.length >= 5) {
      return `cid_${hashStringDeterministic(`NAME_ADDR::${normNameKey}::${normAddrKey}`)}`;
    }
    if (normNameKey && (category || location)) {
      return `cid_${hashStringDeterministic(`NAME_CAT_LOC::${normNameKey}::${category || ""}::${location || ""}::${searchUnitId || "none"}`)}`;
    }
    return `cid_${hashStringDeterministic(`FALLBACK::${normNameKey || "unknown"}::${searchUnitId || "none"}`)}`;
  }
  _updateIndexes(candidate) {
    const cid = candidate.candidateId;
    const pid = candidate.placeId?.parsedValue ?? candidate.placeId?.rawValue;
    if (pid && (pid.startsWith("ChIJ") || pid.startsWith("0x") || pid.includes(":"))) {
      this._byPlaceId.set(pid.trim(), cid);
    }
    const mapsUrl = candidate.mapsUrl?.parsedValue ?? candidate.mapsUrl?.rawValue;
    const slug = normalizeMapsUrlSlug(mapsUrl);
    if (slug && slug.length >= 3) {
      this._byMapsUrlSlug.set(slug, cid);
    }
    const rawName = candidate.businessName?.parsedValue ?? candidate.businessName?.rawValue;
    const normName = normalizeBusinessNameForIdentity(rawName);
    const rawAddr = candidate.address?.parsedValue ?? candidate.address?.rawValue;
    const normAddr = normalizeAddressForIdentity(rawAddr);
    if (normName.comparisonKey && normAddr.comparisonKey && normAddr.comparisonKey.length >= 5) {
      this._byNameAddressKey.set(`${normName.comparisonKey}::${normAddr.comparisonKey}`, cid);
    }
    if (normName.comparisonKey) {
      let set = this._byNameKey.get(normName.comparisonKey);
      if (!set) {
        set = /* @__PURE__ */ new Set();
        this._byNameKey.set(normName.comparisonKey, set);
      }
      set.add(cid);
    }
    const rawPhone = candidate.phone?.parsedValue ?? candidate.phone?.rawValue;
    const normPhone = normalizePhoneForIdentity(rawPhone);
    if (normPhone.isValid && normPhone.nationalDigits.length >= 8) {
      let set = this._byPhoneKey.get(normPhone.nationalDigits);
      if (!set) {
        set = /* @__PURE__ */ new Set();
        this._byPhoneKey.set(normPhone.nationalDigits, set);
      }
      set.add(cid);
    }
    const rawWeb = candidate.websiteUrl?.parsedValue ?? candidate.websiteUrl?.rawValue;
    const normWeb = normalizeWebsiteForIdentity(rawWeb);
    if (normWeb.domain) {
      let set = this._byDomainKey.get(normWeb.domain);
      if (!set) {
        set = /* @__PURE__ */ new Set();
        this._byDomainKey.set(normWeb.domain, set);
      }
      set.add(cid);
    }
  }
  /**
   * Generates a comprehensive data quality snapshot for the session.
   */
  getQualitySnapshot() {
    const totalCandidates = this._candidates.size;
    let totalCompleteness = 0;
    const completenessScores = [];
    const completenessDist = {
      tier0To25: 0,
      tier26To50: 0,
      tier51To75: 0,
      tier76To100: 0
    };
    const identityDist = {
      high: 0,
      medium: 0,
      low: 0,
      conflict: 0
    };
    const fieldCounts = {
      businessName: 0,
      category: 0,
      address: 0,
      phone: 0,
      websiteUrl: 0,
      rating: 0,
      reviewCount: 0,
      businessStatus: 0,
      mapsUrl: 0
    };
    let candidatesWithFieldConflicts = 0;
    for (const candidate of this._candidates.values()) {
      const q = candidate.qualityMetrics;
      const score = q.dataCompleteness;
      totalCompleteness += score;
      completenessScores.push(score);
      if (score <= 25) completenessDist.tier0To25++;
      else if (score <= 50) completenessDist.tier26To50++;
      else if (score <= 75) completenessDist.tier51To75++;
      else completenessDist.tier76To100++;
      if (q.identityConfidence === "HIGH") identityDist.high++;
      else if (q.identityConfidence === "MEDIUM") identityDist.medium++;
      else if (q.identityConfidence === "LOW") identityDist.low++;
      else if (q.identityConfidence === "CONFLICT") identityDist.conflict++;
      for (const [fn, st] of Object.entries(q.fieldStates)) {
        if (st === "CONFIDENT" || st === "SUPPORTED") {
          fieldCounts[fn] = (fieldCounts[fn] || 0) + 1;
        }
      }
      if (q.conflictFieldCount > 0) {
        candidatesWithFieldConflicts++;
      }
    }
    completenessScores.sort((a, b) => a - b);
    const medianCompleteness = completenessScores.length > 0 ? completenessScores[Math.floor(completenessScores.length / 2)] : 0;
    const averageCompleteness = totalCandidates > 0 ? Math.round(totalCompleteness / totalCandidates * 10) / 10 : 0;
    const duplicateRate = this._rawObservations > 0 ? Math.round(this._duplicateObservations / this._rawObservations * 1e3) / 1e3 : 0;
    return {
      totalRawObservations: this._rawObservations,
      uniqueCandidates: totalCandidates,
      duplicateObservations: this._duplicateObservations,
      duplicateRate,
      potentialDuplicatesCount: this._potentialDuplicates.size,
      identityConflictsCount: this._identityConflicts.size,
      candidatesWithFieldConflictsCount: candidatesWithFieldConflicts,
      averageCompleteness,
      medianCompleteness,
      completenessDistribution: completenessDist,
      identityTierDistribution: identityDist,
      fieldPresenceCounts: fieldCounts
    };
  }
  exportCheckpointData() {
    return {
      sessionId: this._sessionId,
      knownCount: this._candidates.size,
      knownCandidateIds: [...this._candidateOrder],
      rawObservations: this._rawObservations,
      duplicateObservations: this._duplicateObservations
    };
  }
  importCheckpointData(data) {
    if (data?.knownCandidateIds) {
      for (const id of data.knownCandidateIds) {
        if (!this._candidates.has(id)) {
          this._candidateOrder.push(id);
          this._candidates.set(id, { candidateId: id });
        }
      }
    }
    if (typeof data?.rawObservations === "number") {
      this._rawObservations = data.rawObservations;
    }
    if (typeof data?.duplicateObservations === "number") {
      this._duplicateObservations = data.duplicateObservations;
    }
  }
  clear() {
    this._candidates.clear();
    this._candidateOrder.length = 0;
    this._byPlaceId.clear();
    this._byMapsUrlSlug.clear();
    this._byNameAddressKey.clear();
    this._byNameKey.clear();
    this._byPhoneKey.clear();
    this._byDomainKey.clear();
    this._potentialDuplicates.clear();
    this._identityConflicts.clear();
    this._rawObservations = 0;
    this._duplicateObservations = 0;
  }
  dispose() {
    this.clear();
  }
};

// src/extension/acquisition/engine/candidateIdentity.ts
function normalizeIdentityText(input) {
  if (!input) return "";
  return input.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?]/g, " ").replace(/\s+/g, " ").trim();
}
function normalizeMapsUrlForIdentity(url) {
  if (!url) return void 0;
  try {
    const parsed = new URL(url);
    const placeMatch = parsed.pathname.match(/\/maps\/place\/([^/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      return decodeURIComponent(placeMatch[1]).toLowerCase().replace(/\+/g, " ").trim();
    }
    const q = parsed.searchParams.get("q");
    if (q) {
      return q.toLowerCase().replace(/\+/g, " ").trim();
    }
  } catch {
    if (url.includes("/maps/place/")) {
      const parts = url.split("/maps/place/")[1]?.split(/[\/@?]/)[0];
      if (parts) return parts.toLowerCase().replace(/\+/g, " ").trim();
    }
  }
  return void 0;
}
function deriveCandidateIdentity(candidate) {
  const normName = normalizeIdentityText(candidate.businessName);
  const normAddress = normalizeIdentityText(candidate.address);
  const normCategory = normalizeIdentityText(candidate.category);
  const normLocation = normalizeIdentityText(candidate.searchLocation);
  const placeId = candidate.placeId?.trim();
  const normUrlSlug = normalizeMapsUrlForIdentity(candidate.mapsUrl);
  if (placeId && (placeId.startsWith("ChIJ") || placeId.startsWith("0x") || placeId.includes(":"))) {
    const candidateId2 = `cid_${hashStringDeterministic(`PID::${placeId}`)}`;
    return {
      candidateId: candidateId2,
      identityMethod: "VISIBLE_PLACE_ID",
      identityConfidence: 0.99,
      evidence: `PlaceId:${placeId}`
    };
  }
  if (normUrlSlug && normUrlSlug.length >= 3) {
    const candidateId2 = `cid_${hashStringDeterministic(`URL::${normUrlSlug}`)}`;
    return {
      candidateId: candidateId2,
      identityMethod: "MAPS_URL",
      identityConfidence: 0.95,
      evidence: `MapsUrlSlug:${normUrlSlug}`
    };
  }
  if (normName && normAddress && normAddress.length >= 5) {
    const composite = `NAME_ADDR::${normName}::${normAddress}`;
    const candidateId2 = `cid_${hashStringDeterministic(composite)}`;
    return {
      candidateId: candidateId2,
      identityMethod: "NAME_ADDRESS",
      identityConfidence: 0.85,
      evidence: `${normName} | ${normAddress}`
    };
  }
  if (normName && (normCategory || normLocation)) {
    const composite = `NAME_CAT_LOC::${normName}::${normCategory || ""}::${normLocation || ""}`;
    const candidateId2 = `cid_${hashStringDeterministic(composite)}`;
    return {
      candidateId: candidateId2,
      identityMethod: "NAME_CATEGORY_LOCATION",
      identityConfidence: 0.75,
      evidence: `${normName} | ${normCategory} | ${normLocation}`
    };
  }
  const fallbackComposite = `FALLBACK::${normName || "unknown"}::${candidate.searchUnitId || "none"}`;
  const candidateId = `cid_${hashStringDeterministic(fallbackComposite)}`;
  return {
    candidateId,
    identityMethod: "WEAK_FALLBACK",
    identityConfidence: 0.5,
    evidence: `Fallback:${normName || "unknown"}`
  };
}
var SessionCandidateDeduplicator = class {
  constructor(searchUnitId = "") {
    this._searchUnitId = searchUnitId;
    this._registry = new CandidateRegistry(searchUnitId);
  }
  get searchUnitId() {
    return this._searchUnitId;
  }
  get registry() {
    return this._registry;
  }
  get size() {
    return this._registry.size;
  }
  get knownCandidateIds() {
    return this._registry.knownCandidateIds;
  }
  has(candidateId) {
    return this._registry.has(candidateId);
  }
  get(candidateId) {
    return this._registry.get(candidateId);
  }
  getAll() {
    return this._registry.getAll();
  }
  updateCandidate(candidate) {
    this._registry.updateCandidate(candidate);
  }
  getEnrichedCount() {
    return this._registry.getEnrichedCount();
  }
  getStats() {
    const stats = this._registry.getStats();
    return {
      uniqueCandidates: stats.uniqueCandidates,
      duplicateObservations: stats.duplicateObservations,
      rawObservations: stats.rawObservations
    };
  }
  getExtendedStats() {
    return this._registry.getStats();
  }
  getQualitySnapshot() {
    return this._registry.getQualitySnapshot();
  }
  getPotentialDuplicates() {
    return this._registry.getPotentialDuplicates();
  }
  getIdentityConflicts() {
    return this._registry.getIdentityConflicts();
  }
  register(candidate) {
    const res = this._registry.registerObservation(candidate);
    return {
      isNew: res.isNew,
      candidate: res.candidate,
      candidateId: res.candidateId
    };
  }
  registerObservation(candidate) {
    return this.register(candidate);
  }
  exportCheckpointData() {
    const exp = this._registry.exportCheckpointData();
    return {
      searchUnitId: this._searchUnitId,
      knownCount: exp.knownCount,
      knownCandidateIds: exp.knownCandidateIds,
      rawObservations: exp.rawObservations,
      duplicateObservations: exp.duplicateObservations
    };
  }
  importCheckpointData(data) {
    this._registry.importCheckpointData(data);
  }
  clear() {
    this._registry.clear();
  }
  seedFromCheckpoint(knownIds) {
    this._registry.importCheckpointData({ knownCandidateIds: knownIds });
  }
};

// src/extension/qualification/googleMaps/researchQualificationEngine.ts
var DEFAULT_RESEARCH_FILTERS = Object.freeze({
  rating: "ANY",
  website: "ANY"
});
function normalizeRatingFilter(input) {
  if (typeof input !== "string") return "ANY";
  const trimmed = input.trim();
  if (trimmed === "FOUR_POINT_FIVE_PLUS" || trimmed === "MIN_4_5" || trimmed === "4.5+" || trimmed === "4.5") {
    return "FOUR_POINT_FIVE_PLUS";
  }
  if (trimmed === "FOUR_PLUS" || trimmed === "MIN_4_0" || trimmed === "4.0+" || trimmed === "4.0") {
    return "FOUR_PLUS";
  }
  return "ANY";
}
function normalizeWebsiteFilter(input) {
  if (typeof input !== "string") return "ANY";
  const trimmed = input.trim();
  if (trimmed === "WITH_WEBSITE" || trimmed === "WITH" || trimmed === "YES" || trimmed === "PRESENT") {
    return "WITH_WEBSITE";
  }
  if (trimmed === "WITHOUT_WEBSITE" || trimmed === "WITHOUT" || trimmed === "NO" || trimmed === "ABSENT") {
    return "WITHOUT_WEBSITE";
  }
  return "ANY";
}
function normalizeResearchFilters(input) {
  if (!input || typeof input !== "object") {
    return DEFAULT_RESEARCH_FILTERS;
  }
  const obj = input;
  const rating = normalizeRatingFilter(obj.rating);
  const website = normalizeWebsiteFilter(obj.website);
  const maxResults = typeof obj.maxResults === "number" && obj.maxResults > 0 ? Math.floor(obj.maxResults) : void 0;
  return Object.freeze({
    rating,
    website,
    ...maxResults !== void 0 ? { maxResults } : {}
  });
}
function extractRatingSignal(candidate) {
  if (!candidate || typeof candidate !== "object") {
    return { availability: "UNKNOWN" };
  }
  const rawRating = candidate.rating;
  if (typeof rawRating === "number") {
    if (Number.isFinite(rawRating)) {
      return { availability: "PRESENT", value: rawRating };
    }
    return { availability: "UNKNOWN" };
  }
  if (rawRating === null || rawRating === void 0) {
    return { availability: "UNKNOWN" };
  }
  if (typeof rawRating === "object") {
    const field = rawRating;
    const avail = field.availability || "UNKNOWN";
    if (avail === "PRESENT") {
      if (typeof field.parsedValue === "number" && Number.isFinite(field.parsedValue)) {
        return { availability: "PRESENT", value: field.parsedValue };
      }
      if (typeof field.rawValue === "string") {
        const parsed = parseFloat(field.rawValue);
        if (Number.isFinite(parsed)) {
          return { availability: "PRESENT", value: parsed };
        }
      }
      return { availability: "AMBIGUOUS" };
    }
    return { availability: avail };
  }
  return { availability: "UNKNOWN" };
}
function determineWebsiteState2(candidate) {
  if (!candidate || typeof candidate !== "object") {
    return "UNKNOWN";
  }
  const explicitState = candidate.websiteState;
  if (explicitState === "YES" || explicitState === "NO" || explicitState === "UNKNOWN") {
    return explicitState;
  }
  const webField = candidate.websiteUrl || candidate.website;
  if (!webField) {
    return "UNKNOWN";
  }
  if (typeof webField === "string") {
    const trimmed = webField.trim();
    if (trimmed.length === 0) return "UNKNOWN";
    const norm = normalizeWebsiteUrl(trimmed);
    if (norm.isValid && !norm.normalizedUrl.includes("google.com/maps")) {
      return "YES";
    }
    return "UNKNOWN";
  }
  if (typeof webField === "object") {
    const field = webField;
    const avail = field.availability || "UNKNOWN";
    if (avail === "PRESENT") {
      const target = typeof field.parsedValue === "string" && field.parsedValue || typeof field.rawValue === "string" && field.rawValue;
      if (target) {
        const norm = normalizeWebsiteUrl(target);
        if (norm.isValid && !norm.normalizedUrl.includes("google.com/maps")) {
          return "YES";
        }
      }
      return "UNKNOWN";
    }
    if (avail === "ABSENT") {
      return "NO";
    }
    return "UNKNOWN";
  }
  return "UNKNOWN";
}
function qualifiesCandidate(candidate, filtersInput) {
  const filters = normalizeResearchFilters(filtersInput);
  let ratingQualified = false;
  let ratingRejectionReason;
  const ratingSignal = extractRatingSignal(candidate);
  if (filters.rating === "ANY") {
    ratingQualified = true;
  } else {
    const threshold = filters.rating === "FOUR_POINT_FIVE_PLUS" ? 4.5 : 4;
    if (ratingSignal.availability === "PRESENT" && ratingSignal.value !== void 0) {
      if (ratingSignal.value >= threshold) {
        ratingQualified = true;
      } else {
        ratingQualified = false;
        ratingRejectionReason = "RATING_BELOW_THRESHOLD";
      }
    } else {
      ratingQualified = false;
      ratingRejectionReason = "RATING_UNKNOWN";
    }
  }
  let websiteQualified = false;
  let websiteRejectionReason;
  const webState = determineWebsiteState2(candidate);
  if (filters.website === "ANY") {
    websiteQualified = true;
  } else if (filters.website === "WITH_WEBSITE") {
    if (webState === "YES") {
      websiteQualified = true;
    } else if (webState === "NO") {
      websiteQualified = false;
      websiteRejectionReason = "WEBSITE_MISSING";
    } else {
      websiteQualified = false;
      websiteRejectionReason = "WEBSITE_UNKNOWN";
    }
  } else if (filters.website === "WITHOUT_WEBSITE") {
    if (webState === "NO") {
      websiteQualified = true;
    } else if (webState === "YES") {
      websiteQualified = false;
      websiteRejectionReason = "WEBSITE_MISSING";
    } else {
      websiteQualified = false;
      websiteRejectionReason = "WEBSITE_UNKNOWN";
    }
  }
  const qualified = ratingQualified && websiteQualified;
  let rejectionReason;
  if (!ratingQualified) {
    rejectionReason = ratingRejectionReason;
  } else if (!websiteQualified) {
    rejectionReason = websiteRejectionReason;
  }
  return {
    qualified,
    ratingQualified,
    websiteQualified,
    ...rejectionReason ? { rejectionReason } : {}
  };
}
function createInitialCounters() {
  return {
    queries: 0,
    candidatesDiscovered: 0,
    duplicatesSuppressed: 0,
    ratingQualified: 0,
    websiteQualified: 0,
    finalQualified: 0,
    failedQueries: 0
  };
}
async function executeMultiQueryResearch(options, executeQuery) {
  const filters = normalizeResearchFilters(options.filters);
  const maxResults = options.maxResults ?? filters.maxResults;
  const deduplicator = new SessionCandidateDeduplicator();
  const counters = createInitialCounters();
  const allRawObservations = [];
  const qualificationMap = /* @__PURE__ */ new Map();
  const qualifiedCandidateList = [];
  let isCancelled = false;
  let isLimitReached = false;
  for (let i = 0; i < options.keywords.length; i++) {
    if (options.shouldStop && options.shouldStop()) {
      isCancelled = true;
      break;
    }
    if (maxResults !== void 0 && counters.finalQualified >= maxResults) {
      isLimitReached = true;
      break;
    }
    const keyword = options.keywords[i];
    counters.queries++;
    let queryObservations = [];
    try {
      queryObservations = await executeQuery(keyword, i);
    } catch {
      counters.failedQueries++;
      if (options.onProgress) {
        options.onProgress({ ...counters });
      }
      continue;
    }
    for (const rawObs of queryObservations) {
      counters.candidatesDiscovered++;
      allRawObservations.push(rawObs);
      const dedupeResult = deduplicator.register(rawObs);
      const sessionCand = dedupeResult.candidate;
      if (!dedupeResult.isNew) {
        counters.duplicatesSuppressed++;
      } else {
        const qual = qualifiesCandidate(sessionCand, filters);
        qualificationMap.set(sessionCand.candidateId, qual);
        if (qual.ratingQualified) {
          counters.ratingQualified++;
        }
        if (qual.websiteQualified) {
          counters.websiteQualified++;
        }
        if (qual.qualified) {
          counters.finalQualified++;
          qualifiedCandidateList.push(sessionCand);
          if (options.onCandidateQualified) {
            options.onCandidateQualified(sessionCand, qual);
          }
        }
      }
      if (options.shouldStop && options.shouldStop()) {
        isCancelled = true;
        break;
      }
      if (maxResults !== void 0 && counters.finalQualified >= maxResults) {
        isLimitReached = true;
        break;
      }
    }
    if (options.onProgress) {
      options.onProgress({ ...counters });
    }
    if (isCancelled || isLimitReached) {
      break;
    }
  }
  const status = isCancelled ? "CANCELLED" : isLimitReached ? "LIMIT_REACHED" : counters.failedQueries > 0 ? "PARTIALLY_COMPLETED" : "COMPLETED";
  return {
    status,
    counters: Object.freeze({ ...counters }),
    rawCandidates: Object.freeze([...allRawObservations]),
    deduplicatedCandidates: Object.freeze(deduplicator.getAll()),
    qualifiedCandidates: Object.freeze([...qualifiedCandidateList]),
    qualificationResults: qualificationMap
  };
}

// src/extension/leadIntelligence/types.ts
var CURRENT_LEAD_RECORD_SCHEMA_VERSION = "lead-intelligence-v1";

// src/extension/ui/security.ts
function isValidExternalUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed === "") return false;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:") || lower.startsWith("file:") || lower.startsWith("blob:")) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// src/extension/leadIntelligence/sanitizer.ts
var BANNED_KEYS2 = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
var MAX_COLLECTION_SIZE = 100;
var MAX_STRING_LENGTH = 2e3;
function sanitizeObject(input, depth = 0) {
  if (depth > 12) {
    return null;
  }
  if (input === null || typeof input !== "object") {
    if (typeof input === "string") {
      return sanitizeString(input);
    }
    return input;
  }
  if (Array.isArray(input)) {
    const safeArr = [];
    const maxItems = Math.min(input.length, MAX_COLLECTION_SIZE);
    for (let i = 0; i < maxItems; i++) {
      safeArr.push(sanitizeObject(input[i], depth + 1));
    }
    return safeArr;
  }
  const cleanObj = /* @__PURE__ */ Object.create(null);
  for (const [key, val] of Object.entries(input)) {
    if (BANNED_KEYS2.has(key)) {
      continue;
    }
    cleanObj[key] = sanitizeObject(val, depth + 1);
  }
  return cleanObj;
}
function sanitizeString(val, maxLength = MAX_STRING_LENGTH) {
  if (val == null) return "";
  const str = String(val).normalize("NFC").trim();
  if (str.length > maxLength) {
    return str.slice(0, maxLength);
  }
  return str;
}
function sanitizeUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!isValidExternalUrl(trimmed)) {
    return "";
  }
  return trimmed;
}
function normalizeForIdentityComparison(str) {
  return (str || "").normalize("NFC").replace(/[^\p{L}\p{N}\s]/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}
function normalizePhoneForComparison(phone) {
  let digits = (phone || "").replace(/[^0-9]/g, "");
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }
  if (digits.length > 7 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  return digits;
}
function evaluateRestrictionFirewall(inputs) {
  const isGoogleRestricted = inputs.isExplicitlyRestricted === true || inputs.hasGoogleConsumerWeb === true || inputs.restrictionBasis === "GOOGLE_CONSUMER_WEB_RESTRICTED" || (inputs.provenances || []).some((p) => p === "GOOGLE_DERIVED");
  if (isGoogleRestricted) {
    return {
      isRestricted: true,
      persistenceEligible: false,
      exportEligible: false,
      restrictionBasis: "GOOGLE_CONSUMER_WEB_RESTRICTED",
      upstreamRestrictions: [
        "NOT_PERSISTABLE",
        "NOT_EXPORTABLE",
        "GOOGLE_CONSUMER_WEB_RESTRICTED"
      ]
    };
  }
  return {
    isRestricted: false,
    persistenceEligible: true,
    exportEligible: true,
    restrictionBasis: "NONE",
    upstreamRestrictions: []
  };
}

// src/extension/export/exportPolicy.ts
var ExportPolicy = class {
  /**
   * Evaluates a single field contribution against export policy rules.
   */
  evaluateField(fieldName, eligibility, primarySource) {
    if (!eligibility) {
      if (primarySource === "GOOGLE_MAPS") {
        return {
          fieldName,
          decision: "EXPORT_BLOCKED",
          reasonCode: "BLOCKED_BY_SOURCE_POLICY",
          sourceFamily: "GOOGLE_MAPS",
          provenance: "GOOGLE_DERIVED"
        };
      }
      return {
        fieldName,
        decision: "EXPORT_ALLOWED",
        reasonCode: "FIELD_DEFAULT_ELIGIBLE",
        sourceFamily: "META",
        provenance: "LEADNORIA_DERIVED"
      };
    }
    if (eligibility.sourceProvenance === "GOOGLE_DERIVED") {
      if (!eligibility.isEligible) {
        return {
          fieldName,
          decision: "EXPORT_BLOCKED",
          reasonCode: eligibility.restrictionBasis || "BLOCKED_BY_GOOGLE_CONSUMER_POLICY",
          sourceFamily: "GOOGLE_MAPS",
          provenance: "GOOGLE_DERIVED"
        };
      }
    }
    const sourceFamily = eligibility.sourceProvenance === "GOOGLE_DERIVED" ? "GOOGLE_MAPS" : eligibility.sourceProvenance === "META_DERIVED" ? "META" : "WEBSITE";
    if (!eligibility.isEligible) {
      return {
        fieldName,
        decision: "EXPORT_BLOCKED",
        reasonCode: eligibility.restrictionBasis || "BLOCKED_BY_POLICY",
        sourceFamily,
        provenance: eligibility.sourceProvenance
      };
    }
    return {
      fieldName,
      decision: "EXPORT_ALLOWED",
      reasonCode: "POLICY_APPROVED",
      sourceFamily,
      provenance: eligibility.sourceProvenance
    };
  }
  /**
   * Evaluates an entire UnifiedResearchRecord for export readiness.
   */
  evaluateRecord(record) {
    const fieldEvaluations = [];
    const excludedFields = [];
    if (record.restrictions.exportEligible === false) {
      const allFields = Object.keys(record.fieldEligibility || {});
      return {
        recordId: record.recordId,
        isEligibleForExport: false,
        fieldEvaluations: allFields.map((f) => this.evaluateField(f, record.fieldEligibility[f], record.primarySource)),
        projection: null,
        excludedFields: allFields,
        blockedReason: record.restrictions.restrictionBasis || "RECORD_NOT_EXPORTABLE_BY_POLICY"
      };
    }
    const targetFields = /* @__PURE__ */ new Set([
      "businessName",
      "website",
      "phone",
      "email",
      "address",
      "category",
      "social",
      ...Object.keys(record.fieldEligibility || {})
    ]);
    for (const field of targetFields) {
      const eligibility = record.fieldEligibility[field];
      const evaluation = this.evaluateField(field, eligibility, record.primarySource);
      fieldEvaluations.push(evaluation);
      if (evaluation.decision !== "EXPORT_ALLOWED") {
        excludedFields.push(field);
      }
    }
    const allowedFields = fieldEvaluations.filter((f) => f.decision === "EXPORT_ALLOWED");
    if (allowedFields.length === 0) {
      return {
        recordId: record.recordId,
        isEligibleForExport: false,
        fieldEvaluations,
        projection: null,
        excludedFields,
        blockedReason: "ALL_FIELDS_RESTRICTED_BY_SOURCE_POLICY"
      };
    }
    return {
      recordId: record.recordId,
      isEligibleForExport: true,
      fieldEvaluations,
      projection: null,
      // Populated by ExportProjection
      excludedFields
    };
  }
};

// src/extension/export/exportProjection.ts
var ExportProjection = class {
  /**
   * Projects a UnifiedResearchRecord into an ExportRecordProjection,
   * respecting field-level policy exclusions.
   */
  projectRecord(record, evaluation, exportedAt) {
    if (!evaluation.isEligibleForExport) {
      return null;
    }
    const excluded = new Set(evaluation.excludedFields);
    const businessName = excluded.has("businessName") ? "" : record.canonicalDisplayName || record.normalizedEntity?.businessName?.value?.displayName || "";
    let website = "";
    if (!excluded.has("website")) {
      website = record.websiteVerificationResult?.finalUrl || record.normalizedEntity?.websiteUrl?.value?.normalizedUrl || "";
    }
    let phone = "";
    if (!excluded.has("phone")) {
      if (record.contactEnrichmentResult?.phones && record.contactEnrichmentResult.phones.length > 0) {
        phone = record.contactEnrichmentResult.phones[0].e164Format || record.contactEnrichmentResult.phones[0].nationalFormat || record.contactEnrichmentResult.phones[0].normalizedValue || "";
      } else if (record.normalizedEntity?.phones && record.normalizedEntity.phones.length > 0) {
        const p = record.normalizedEntity.phones[0];
        phone = p.value?.e164Format || p.value?.internationalFormat || p.value?.nationalFormat || p.value?.rawPhone || "";
      }
    }
    let email = "";
    if (!excluded.has("email")) {
      if (record.contactEnrichmentResult?.emails && record.contactEnrichmentResult.emails.length > 0) {
        email = record.contactEnrichmentResult.emails[0].normalizedEmail || "";
      } else if (record.normalizedEntity?.emails && record.normalizedEntity.emails.length > 0) {
        email = record.normalizedEntity.emails[0].value?.normalizedEmail || "";
      }
    }
    let streetAddress = "";
    let city = "";
    let country = "";
    if (!excluded.has("address")) {
      if (record.contactEnrichmentResult?.addresses && record.contactEnrichmentResult.addresses.length > 0) {
        const loc = record.contactEnrichmentResult.addresses[0];
        streetAddress = loc.streetAddress || loc.normalizedAddress || loc.rawAddress || "";
        city = loc.city || "";
        country = loc.country || "";
      } else if (record.normalizedEntity?.address?.value) {
        const addr = record.normalizedEntity.address.value;
        streetAddress = addr.displayAddress || addr.normalizedAddress || "";
        city = addr.locality || "";
        country = addr.country || addr.countryCode || "";
      }
    }
    let category = "";
    if (!excluded.has("category")) {
      const cats = record.normalizedEntity?.categories || [];
      if (cats.length > 0) {
        category = cats[0].value?.normalizedCategory || cats[0].value?.sourceCategory || "";
      }
    }
    const relevance = record.relevanceResult?.evidenceTier || record.relevanceResult?.relevanceState || "UNCERTAIN";
    const qualificationStatus = record.qualificationDecision?.status || record.qualificationState || "NOT_EVALUATED";
    const qualificationScore = record.qualificationDecision?.scoreSummary?.totalScore !== void 0 ? String(record.qualificationDecision.scoreSummary.totalScore) : "";
    return {
      recordId: record.recordId,
      businessName,
      website,
      phone,
      email,
      streetAddress,
      city,
      country,
      category,
      relevance,
      qualificationStatus,
      qualificationScore,
      primarySource: record.primarySource,
      provenance: record.provenance,
      corroborationCount: record.corroborationCount || 1,
      exportedAt: exportedAt || record.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};

// src/extension/leadIntelligence/recordAssembler.ts
var RecordAssembler = class _RecordAssembler {
  static {
    this.entitySeq = 0;
  }
  constructor() {
    this.exportPolicy = new ExportPolicy();
    this.exportProjection = new ExportProjection();
  }
  /**
   * Assembles a comprehensive canonical lead intelligence record from multi-source inputs.
   */
  assemble(rawInput) {
    const input = sanitizeObject(rawInput);
    const now = input.referenceNow || (/* @__PURE__ */ new Date()).toISOString();
    const maxAgeDays = input.freshnessMaxAgeDays ?? 90;
    const entityGroup = input.resolvedEntityGroup;
    let fallbackId = "";
    if (input.googleCandidate?.placeId) {
      fallbackId = `ent_${input.googleCandidate.placeId}`;
    } else if (input.metaCandidate?.pageId) {
      fallbackId = `ent_${input.metaCandidate.pageId}`;
    } else if (input.websiteResult?.identity?.domain) {
      fallbackId = `ent_${input.websiteResult.identity.domain.replace(/[^a-zA-Z0-9]/g, "_")}`;
    } else if (input.metaCandidate?.pageUrl) {
      fallbackId = `ent_${input.metaCandidate.pageUrl.replace(/[^a-zA-Z0-9]/g, "_")}`;
    }
    const entityId = entityGroup?.entityId || input.candidates?.[0]?.candidateId || input.candidateEnvelopes?.[0]?.candidateId || fallbackId || `ent_${++_RecordAssembler.entitySeq}`;
    const sourceSignals = {};
    if (input.metaCandidate) {
      sourceSignals.metaEvidence = {
        adCount: input.metaCandidate.adCount ?? 0,
        adStatus: input.metaCandidate.adStatus || "UNKNOWN",
        adPlatforms: [...input.metaCandidate.adPlatforms || []].sort(),
        pageUrl: sanitizeUrl(input.metaCandidate.pageUrl),
        pageId: input.metaCandidate.pageId,
        firstSeen: input.metaCandidate.observedAt || now,
        lastSeen: input.metaCandidate.observedAt || now
      };
    }
    if (input.googleCandidate) {
      sourceSignals.googleEvidence = {
        placeId: input.googleCandidate.placeId,
        businessName: sanitizeString(input.googleCandidate.businessName),
        rating: typeof input.googleCandidate.rating === "number" ? input.googleCandidate.rating : void 0,
        reviewCount: typeof input.googleCandidate.reviewCount === "number" ? input.googleCandidate.reviewCount : void 0,
        categories: [...input.googleCandidate.categories || []].sort(),
        observedAt: input.googleCandidate.observedAt || now,
        isRestricted: input.googleCandidate.isRestricted ?? true,
        mapsUrl: sanitizeUrl(input.googleCandidate.mapsUrl)
      };
    }
    if (input.websiteResult) {
      const cmsSignal = (input.websiteResult.technologySignals || []).find((t) => t.category === "CMS");
      sourceSignals.websiteEvidence = {
        domain: sanitizeString(input.websiteResult.identity?.domain),
        verifiedUrl: sanitizeUrl(input.websiteResult.identity?.canonicalUrl),
        cms: cmsSignal?.name,
        technologySignals: (input.websiteResult.technologySignals || []).map((t) => t.name).sort(),
        hasBooking: (input.websiteResult.technologySignals || []).some((t) => t.category === "BOOKING"),
        hasEcommerce: (input.websiteResult.technologySignals || []).some((t) => t.category === "ECOMMERCE"),
        hasChat: (input.websiteResult.technologySignals || []).some((t) => t.category === "CHAT_WIDGET"),
        pageCount: input.websiteResult.crawlStats?.pagesVisited?.length || input.websiteResult.crawlStats?.pagesDiscovered || 1,
        observedAt: input.websiteResult.observedAt || now
      };
    }
    if (input.userOverride) {
      sourceSignals.userProvidedEvidence = {
        userProvidedUrl: sanitizeUrl(input.userOverride.website),
        userProvidedName: sanitizeString(input.userOverride.businessName),
        userProvidedFields: {
          phone: input.userOverride.phone,
          email: input.userOverride.email,
          address: input.userOverride.address
        },
        providedAt: input.userOverride.providedAt || now
      };
    }
    const allProvenances = [];
    if (entityGroup?.sourceContributions) {
      allProvenances.push(...entityGroup.sourceContributions.map((c) => c.provenance));
    }
    if (input.candidates) {
      allProvenances.push(...input.candidates.map((c) => c.overallProvenance));
    }
    if (input.candidateEnvelopes) {
      allProvenances.push(...input.candidateEnvelopes.map((e) => e.provenance));
    }
    if (input.googleCandidate) allProvenances.push("GOOGLE_DERIVED");
    if (input.metaCandidate) allProvenances.push("META_DERIVED");
    if (input.websiteResult) allProvenances.push("WEBSITE_DERIVED");
    if (input.userOverride) allProvenances.push("USER_PROVIDED");
    const hasGoogleConsumerWeb = entityGroup?.policySummary?.hasGoogleConsumerWebLineage === true || entityGroup?.policySummary?.isRestricted === true || input.googleCandidate?.isRestricted === true || allProvenances.includes("GOOGLE_DERIVED");
    const policyFirewall = evaluateRestrictionFirewall({
      isExplicitlyRestricted: hasGoogleConsumerWeb,
      hasGoogleConsumerWeb,
      provenances: allProvenances
    });
    const policySummary = {
      isRestricted: policyFirewall.isRestricted,
      persistenceEligible: policyFirewall.persistenceEligible,
      exportEligible: policyFirewall.exportEligible,
      restrictionBasis: policyFirewall.restrictionBasis,
      upstreamRestrictions: policyFirewall.upstreamRestrictions,
      overallProvenance: allProvenances.length > 1 ? "MIXED" : allProvenances[0] || "LEADNORIA_DERIVED",
      hasGoogleConsumerWebLineage: hasGoogleConsumerWeb,
      hasMetaLineage: allProvenances.includes("META_DERIVED"),
      hasWebsiteLineage: allProvenances.includes("WEBSITE_DERIVED"),
      hasUserProvidedLineage: allProvenances.includes("USER_PROVIDED")
    };
    const perSourceFreshness = {};
    const recordTimestamp = (source, ts) => {
      const observed = ts || now;
      if (!perSourceFreshness[source]) {
        perSourceFreshness[source] = {
          sourceType: source,
          firstObservedAt: observed,
          lastObservedAt: observed,
          state: this.computeFreshnessState(observed, now, maxAgeDays),
          observationCount: 1
        };
      } else {
        const entry = perSourceFreshness[source];
        entry.observationCount++;
        if (observed < entry.firstObservedAt) entry.firstObservedAt = observed;
        if (observed > entry.lastObservedAt) {
          entry.lastObservedAt = observed;
          entry.state = this.computeFreshnessState(observed, now, maxAgeDays);
        }
      }
    };
    if (input.metaCandidate) recordTimestamp("META_AD_LIBRARY", input.metaCandidate.observedAt);
    if (input.googleCandidate) recordTimestamp("GOOGLE_MAPS", input.googleCandidate.observedAt);
    if (input.websiteResult) recordTimestamp("WEBSITE", input.websiteResult.observedAt);
    if (input.userOverride) recordTimestamp("USER_PROVIDED", input.userOverride.providedAt);
    const timestamps = Object.values(perSourceFreshness).flatMap((f) => [f.firstObservedAt, f.lastObservedAt]);
    const firstObservedAt = timestamps.length > 0 ? [...timestamps].sort()[0] : now;
    const lastObservedAt = timestamps.length > 0 ? [...timestamps].sort().reverse()[0] : now;
    const freshnessModel = {
      firstObservedAt,
      lastObservedAt,
      perSourceFreshness
    };
    const nameAlternatives = [];
    if (input.userOverride?.businessName) {
      nameAlternatives.push({
        value: input.userOverride.businessName,
        source: "USER_PROVIDED",
        provenance: "USER_PROVIDED",
        observedAt: input.userOverride.providedAt || now,
        lineage: ["user-input-form"]
      });
    }
    if (entityGroup?.canonicalDisplayName) {
      nameAlternatives.push({
        value: entityGroup.canonicalDisplayName,
        source: "LEADNORIA",
        provenance: entityGroup.policySummary?.overallProvenance || "LEADNORIA_DERIVED",
        observedAt: entityGroup.createdAt || now,
        lineage: ["phase-8-entity-resolution"]
      });
    }
    if (input.googleCandidate?.businessName) {
      nameAlternatives.push({
        value: input.googleCandidate.businessName,
        source: "GOOGLE_MAPS",
        provenance: "GOOGLE_DERIVED",
        observedAt: input.googleCandidate.observedAt || now,
        sourceUrl: input.googleCandidate.mapsUrl,
        lineage: ["google-maps-candidate"]
      });
    }
    if (input.metaCandidate?.businessName) {
      nameAlternatives.push({
        value: input.metaCandidate.businessName,
        source: "META_AD_LIBRARY",
        provenance: "META_DERIVED",
        observedAt: input.metaCandidate.observedAt || now,
        sourceUrl: input.metaCandidate.pageUrl,
        lineage: ["meta-ad-candidate"]
      });
    }
    if (input.websiteResult?.identity?.businessName) {
      nameAlternatives.push({
        value: input.websiteResult.identity.businessName,
        source: "WEBSITE",
        provenance: "WEBSITE_DERIVED",
        observedAt: input.websiteResult.observedAt || now,
        sourceUrl: input.websiteResult.identity.canonicalUrl,
        lineage: ["website-header-discovery"]
      });
    }
    const canonicalBusinessName = this.buildCanonicalField(
      nameAlternatives,
      "businessName",
      now,
      maxAgeDays,
      input.userOverride?.applyAsPreferred ? input.userOverride.businessName : void 0,
      (a, b) => normalizeForIdentityComparison(a) === normalizeForIdentityComparison(b)
    );
    const websiteAlternatives = [];
    if (input.userOverride?.website) {
      websiteAlternatives.push({
        value: input.userOverride.website,
        source: "USER_PROVIDED",
        provenance: "USER_PROVIDED",
        observedAt: input.userOverride.providedAt || now,
        lineage: ["user-input-form"]
      });
    }
    if (input.websiteResult?.identity?.canonicalUrl) {
      websiteAlternatives.push({
        value: input.websiteResult.identity.canonicalUrl,
        source: "WEBSITE",
        provenance: "WEBSITE_DERIVED",
        observedAt: input.websiteResult.observedAt || now,
        sourceUrl: input.websiteResult.identity.canonicalUrl,
        lineage: ["website-crawl-verification"]
      });
    }
    if (input.googleCandidate?.websiteUrl) {
      websiteAlternatives.push({
        value: input.googleCandidate.websiteUrl,
        source: "GOOGLE_MAPS",
        provenance: "GOOGLE_DERIVED",
        observedAt: input.googleCandidate.observedAt || now,
        sourceUrl: input.googleCandidate.mapsUrl,
        lineage: ["google-maps-listing-url"]
      });
    }
    if (input.metaCandidate?.pageUrl) {
      websiteAlternatives.push({
        value: input.metaCandidate.pageUrl,
        source: "META_AD_LIBRARY",
        provenance: "META_DERIVED",
        observedAt: input.metaCandidate.observedAt || now,
        sourceUrl: input.metaCandidate.pageUrl,
        lineage: ["meta-page-url"]
      });
    }
    const preferredWebsite = input.userOverride?.applyAsPreferred ? input.userOverride.website : input.websiteResult?.identity?.canonicalUrl || void 0;
    const verifiedWebsite = this.buildCanonicalField(
      websiteAlternatives,
      "website",
      now,
      maxAgeDays,
      preferredWebsite,
      (a, b) => {
        try {
          const uA = new URL(a.startsWith("http") ? a : "https://" + a);
          const uB = new URL(b.startsWith("http") ? b : "https://" + b);
          return uA.hostname.replace(/^www\./, "").toLowerCase() === uB.hostname.replace(/^www\./, "").toLowerCase();
        } catch {
          return a.toLowerCase() === b.toLowerCase();
        }
      }
    );
    const domainSet = /* @__PURE__ */ new Set();
    if (input.websiteResult?.identity?.domain) domainSet.add(input.websiteResult.identity.domain.toLowerCase());
    if (entityGroup?.domains) entityGroup.domains.forEach((d) => domainSet.add(d.toLowerCase()));
    if (input.googleCandidate?.websiteUrl) {
      try {
        const u = new URL(input.googleCandidate.websiteUrl.startsWith("http") ? input.googleCandidate.websiteUrl : "https://" + input.googleCandidate.websiteUrl);
        domainSet.add(u.hostname.replace(/^www\./, "").toLowerCase());
      } catch {
      }
    }
    const domainsField = this.buildCanonicalField(
      [{
        value: Array.from(domainSet).sort(),
        source: "LEADNORIA",
        provenance: allProvenances.length > 1 ? "MIXED" : allProvenances[0] || "LEADNORIA_DERIVED",
        observedAt: now,
        lineage: ["domain-deduplication"]
      }],
      "domains",
      now,
      maxAgeDays,
      Array.from(domainSet).sort()
    );
    const categoryAlternatives = [];
    if (input.googleCandidate?.categories && input.googleCandidate.categories.length > 0) {
      categoryAlternatives.push({
        value: [...input.googleCandidate.categories].sort(),
        source: "GOOGLE_MAPS",
        provenance: "GOOGLE_DERIVED",
        observedAt: input.googleCandidate.observedAt || now,
        sourceUrl: input.googleCandidate.mapsUrl,
        lineage: ["google-maps-category-list"]
      });
    }
    if (input.websiteResult?.identity?.categories && input.websiteResult.identity.categories.length > 0) {
      categoryAlternatives.push({
        value: [...input.websiteResult.identity.categories].sort(),
        source: "WEBSITE",
        provenance: "WEBSITE_DERIVED",
        observedAt: input.websiteResult.observedAt || now,
        sourceUrl: input.websiteResult.identity?.canonicalUrl,
        lineage: ["website-identity-category-list"]
      });
    }
    if (input.metaCandidate?.categories && input.metaCandidate.categories.length > 0) {
      categoryAlternatives.push({
        value: [...input.metaCandidate.categories].sort(),
        source: "META_AD_LIBRARY",
        provenance: "META_DERIVED",
        observedAt: input.metaCandidate?.observedAt || now,
        sourceUrl: input.metaCandidate?.pageUrl,
        lineage: ["meta-candidate-category-list"]
      });
    }
    const mergedCategories = Array.from(
      new Set(categoryAlternatives.flatMap((a) => a.value))
    ).sort();
    const categoriesField = this.buildCanonicalField(
      categoryAlternatives.length > 0 ? categoryAlternatives : [{
        value: [],
        source: "LEADNORIA",
        provenance: "LEADNORIA_DERIVED",
        observedAt: now
      }],
      "categories",
      now,
      maxAgeDays,
      mergedCategories
    );
    const statusAlternatives = [];
    if (input.candidates?.[0]?.businessStatus?.value?.status) {
      statusAlternatives.push({
        value: input.candidates[0].businessStatus.value.status,
        source: input.candidates[0].source,
        provenance: input.candidates[0].businessStatus.provenance,
        observedAt: input.candidates[0].normalizationAudit?.normalizedAt || now,
        lineage: ["candidate-business-status"]
      });
    }
    const businessStatusField = this.buildCanonicalField(
      statusAlternatives.length > 0 ? statusAlternatives : [{
        value: "OPERATIONAL",
        source: "LEADNORIA",
        provenance: "LEADNORIA_DERIVED",
        observedAt: now
      }],
      "businessStatus",
      now,
      maxAgeDays,
      statusAlternatives.length === 1 ? statusAlternatives[0].value : void 0
    );
    const descriptionAlternatives = [];
    if (input.websiteResult?.description?.text) {
      descriptionAlternatives.push({
        value: input.websiteResult.description.text,
        source: "WEBSITE",
        provenance: "WEBSITE_DERIVED",
        observedAt: input.websiteResult.observedAt || now,
        sourceUrl: input.websiteResult.identity?.canonicalUrl,
        lineage: ["website-meta-description"]
      });
    }
    const descriptionField = this.buildCanonicalField(
      descriptionAlternatives.length > 0 ? descriptionAlternatives : [{
        value: "",
        source: "LEADNORIA",
        provenance: "LEADNORIA_DERIVED",
        observedAt: now
      }],
      "description",
      now,
      maxAgeDays,
      descriptionAlternatives[0]?.value
    );
    const servicesList = (input.websiteResult?.services || []).map((s) => s.name).sort();
    const servicesField = this.buildCanonicalField(
      [{
        value: servicesList,
        source: "WEBSITE",
        provenance: "WEBSITE_DERIVED",
        observedAt: input.websiteResult?.observedAt || now
      }],
      "services",
      now,
      maxAgeDays,
      servicesList
    );
    const serviceAreasField = this.buildCanonicalField(
      [{
        value: [],
        source: "LEADNORIA",
        provenance: "LEADNORIA_DERIVED",
        observedAt: now
      }],
      "serviceAreas",
      now,
      maxAgeDays,
      []
    );
    const hoursStr = input.websiteResult?.businessHours || "";
    const businessHoursField = this.buildCanonicalField(
      [{
        value: hoursStr,
        source: "WEBSITE",
        provenance: "WEBSITE_DERIVED",
        observedAt: input.websiteResult?.observedAt || now
      }],
      "businessHours",
      now,
      maxAgeDays,
      hoursStr
    );
    const addressAlternatives = [];
    if (input.userOverride?.address) {
      addressAlternatives.push({
        value: input.userOverride.address,
        source: "USER_PROVIDED",
        provenance: "USER_PROVIDED",
        observedAt: input.userOverride.providedAt || now
      });
    }
    if (input.googleCandidate?.address) {
      addressAlternatives.push({
        value: input.googleCandidate.address,
        source: "GOOGLE_MAPS",
        provenance: "GOOGLE_DERIVED",
        observedAt: input.googleCandidate.observedAt || now,
        sourceUrl: input.googleCandidate.mapsUrl
      });
    }
    if (input.websiteResult?.address) {
      const siteAddr = input.websiteResult.address.rawAddress || input.websiteResult.address.normalizedAddress;
      if (siteAddr) {
        addressAlternatives.push({
          value: siteAddr,
          source: "WEBSITE",
          provenance: "WEBSITE_DERIVED",
          observedAt: input.websiteResult.observedAt || now
        });
      }
    }
    if (entityGroup?.addresses) {
      entityGroup.addresses.forEach((addr) => {
        addressAlternatives.push({
          value: addr,
          source: "LEADNORIA",
          provenance: "LEADNORIA_DERIVED",
          observedAt: entityGroup.createdAt || now
        });
      });
    }
    const preferredAddress = input.userOverride?.applyAsPreferred ? input.userOverride.address : void 0;
    const normalizedAddressField = this.buildCanonicalField(
      addressAlternatives,
      "address",
      now,
      maxAgeDays,
      preferredAddress,
      (a, b) => normalizeForIdentityComparison(a) === normalizeForIdentityComparison(b)
    );
    const addressesField = this.buildCanonicalField(
      [{
        value: Array.from(new Set(addressAlternatives.map((a) => a.value))).sort(),
        source: "LEADNORIA",
        provenance: allProvenances.length > 1 ? "MIXED" : allProvenances[0] || "LEADNORIA_DERIVED",
        observedAt: now
      }],
      "addresses",
      now,
      maxAgeDays,
      Array.from(new Set(addressAlternatives.map((a) => a.value))).sort()
    );
    const cityStr = input.websiteResult?.address?.city || input.metaCandidate?.city || input.candidates?.[0]?.geographicObservations?.[0]?.city || "";
    const cityField = this.buildCanonicalField(
      [{ value: cityStr, source: "LEADNORIA", provenance: "LEADNORIA_DERIVED", observedAt: now }],
      "city",
      now,
      maxAgeDays,
      cityStr
    );
    const regionField = this.buildCanonicalField(
      [{ value: "", source: "LEADNORIA", provenance: "LEADNORIA_DERIVED", observedAt: now }],
      "region",
      now,
      maxAgeDays,
      ""
    );
    const countryStr = input.websiteResult?.address?.country || input.metaCandidate?.country || input.candidates?.[0]?.geographicObservations?.[0]?.country || "";
    const countryField = this.buildCanonicalField(
      [{ value: countryStr, source: "LEADNORIA", provenance: "LEADNORIA_DERIVED", observedAt: now }],
      "country",
      now,
      maxAgeDays,
      countryStr
    );
    const socialFactList = (input.websiteResult?.socialProfiles || []).map((s) => ({
      platform: s.platform,
      url: sanitizeUrl(s.normalizedUrl || s.rawUrl),
      handle: s.handleOrPath
    }));
    const socialProfilesField = this.buildCanonicalField(
      [{
        value: socialFactList,
        source: "WEBSITE",
        provenance: "WEBSITE_DERIVED",
        observedAt: input.websiteResult?.observedAt || now
      }],
      "socialProfiles",
      now,
      maxAgeDays,
      socialFactList
    );
    const { canonicalEmails, canonicalPhones } = this.assembleContacts(
      input,
      now,
      maxAgeDays,
      policySummary
    );
    const canonicalPeople = this.assemblePeople(
      input,
      now,
      maxAgeDays,
      policySummary
    );
    const corroborations = [];
    const googlePhone = input.googleCandidate?.phone;
    const websitePhones = (input.websiteResult?.phones || []).map((p) => p.nationalFormat || p.normalizedValue || p.e164Format || p.rawValue || "");
    if (googlePhone && websitePhones.length > 0) {
      const gDigits = normalizePhoneForComparison(googlePhone);
      const matches = websitePhones.some((wp) => normalizePhoneForComparison(wp) === gDigits);
      if (matches && gDigits.length >= 7) {
        corroborations.push({
          field: "phone",
          corroboratedValue: googlePhone,
          sources: ["GOOGLE_MAPS", "WEBSITE"],
          corroborationCount: 2,
          corroboratingReferences: [
            {
              source: "GOOGLE_MAPS",
              observedValue: googlePhone,
              sourceUrl: input.googleCandidate?.mapsUrl,
              observedAt: input.googleCandidate?.observedAt || now
            },
            {
              source: "WEBSITE",
              observedValue: googlePhone,
              sourceUrl: input.websiteResult?.identity?.canonicalUrl,
              observedAt: input.websiteResult?.observedAt || now
            }
          ]
        });
      }
    }
    if (input.googleCandidate?.websiteUrl && input.websiteResult?.identity?.domain) {
      try {
        const listingHost = new URL(input.googleCandidate.websiteUrl.startsWith("http") ? input.googleCandidate.websiteUrl : "https://" + input.googleCandidate.websiteUrl).hostname.replace(/^www\./, "").toLowerCase();
        const siteDomain = input.websiteResult.identity.domain.replace(/^www\./, "").toLowerCase();
        if (listingHost === siteDomain) {
          corroborations.push({
            field: "domain",
            corroboratedValue: siteDomain,
            sources: ["GOOGLE_MAPS", "WEBSITE"],
            corroborationCount: 2,
            corroboratingReferences: [
              {
                source: "GOOGLE_MAPS",
                observedValue: input.googleCandidate.websiteUrl,
                observedAt: input.googleCandidate.observedAt || now
              },
              {
                source: "WEBSITE",
                observedValue: siteDomain,
                observedAt: input.websiteResult.observedAt || now
              }
            ]
          });
        }
      } catch {
      }
    }
    if (input.metaCandidate?.businessName && input.googleCandidate?.businessName) {
      if (normalizeForIdentityComparison(input.metaCandidate.businessName) === normalizeForIdentityComparison(input.googleCandidate.businessName)) {
        corroborations.push({
          field: "businessName",
          corroboratedValue: input.metaCandidate.businessName,
          sources: ["META_AD_LIBRARY", "GOOGLE_MAPS"],
          corroborationCount: 2,
          corroboratingReferences: [
            { source: "META_AD_LIBRARY", observedValue: input.metaCandidate.businessName, observedAt: input.metaCandidate.observedAt || now },
            { source: "GOOGLE_MAPS", observedValue: input.googleCandidate.businessName, observedAt: input.googleCandidate.observedAt || now }
          ]
        });
      }
    }
    const allConflicts = [
      ...canonicalBusinessName.conflicts,
      ...verifiedWebsite.conflicts,
      ...normalizedAddressField.conflicts,
      ...canonicalPhones.flatMap((p) => p.conflicts),
      ...canonicalEmails.flatMap((e) => e.conflicts)
    ];
    const qDecision = input.qualificationDecision;
    const qualificationAttachment = {
      qualificationDecision: qDecision,
      qualificationProfileId: qDecision?.profileId,
      reasonGraph: qDecision?.reasonGraph,
      finalState: qDecision?.status,
      blockingCriteria: qDecision?.blockingReasons || [],
      contradictoryCriteria: qDecision?.contradictionReasons || [],
      explanation: qDecision?.reasonGraph?.primaryRationale || qDecision?.reasonGraph?.summaryText || ""
    };
    const evidencePack = this.buildCompactEvidencePack(
      entityId,
      input,
      allConflicts,
      corroborations,
      now
    );
    const quality = this.computeQualitySummary(
      canonicalBusinessName,
      verifiedWebsite,
      normalizedAddressField,
      canonicalEmails,
      canonicalPhones,
      canonicalPeople,
      corroborations,
      allConflicts
    );
    let entityType = "LOCAL_BUSINESS";
    let branchRelationship = void 0;
    if (entityGroup) {
      const hasBranches = (entityGroup.branchEntityIds || []).length > 0;
      const isBranch = Boolean(entityGroup.parentEntityId);
      if (hasBranches) {
        entityType = "PARENT_ORGANIZATION";
      } else if (isBranch) {
        entityType = "BRANCH";
      }
      branchRelationship = {
        isBranch,
        isParent: hasBranches,
        parentEntityId: entityGroup.parentEntityId,
        branchEntityIds: [...entityGroup.branchEntityIds || []].sort(),
        branchSignals: (entityGroup.branchSignals || []).map((b) => ({ type: b.type, token: b.token }))
      };
    }
    const cmsVal = (input.websiteResult?.technologySignals || []).find((t) => t.category === "CMS")?.name;
    return {
      schemaVersion: CURRENT_LEAD_RECORD_SCHEMA_VERSION,
      canonicalEntityId: entityId,
      canonicalBusinessName,
      aliases: [...entityGroup?.aliases || []].sort(),
      entityType,
      branchRelationship,
      business: {
        categories: categoriesField,
        businessStatus: businessStatusField,
        description: descriptionField,
        services: servicesField,
        serviceAreas: serviceAreasField,
        businessHours: businessHoursField
      },
      location: {
        addresses: addressesField,
        normalizedAddress: normalizedAddressField,
        city: cityField,
        region: regionField,
        country: countryField,
        latitude: void 0,
        longitude: void 0
      },
      digital: {
        verifiedWebsite,
        domains: domainsField,
        socialProfiles: socialProfilesField,
        cms: cmsVal,
        technologySignals: input.websiteResult?.technologySignals || [],
        booking: (input.websiteResult?.technologySignals || []).some((t) => t.category === "BOOKING"),
        ecommerce: (input.websiteResult?.technologySignals || []).some((t) => t.category === "ECOMMERCE"),
        chat: (input.websiteResult?.technologySignals || []).some((t) => t.category === "CHAT_WIDGET"),
        analytics: (input.websiteResult?.technologySignals || []).filter((t) => t.category === "ANALYTICS").map((t) => t.name).sort()
      },
      contacts: {
        emails: canonicalEmails,
        phones: canonicalPhones,
        contactForms: (input.websiteResult?.contactForms || []).map((f) => f.formAction || f.pageUrl).filter(Boolean).sort()
      },
      people: {
        publicPeople: canonicalPeople,
        titles: Array.from(new Set(canonicalPeople.flatMap((p) => p.titles))).sort(),
        personContactAssociations: canonicalPeople.flatMap(
          (p) => p.emails.map((email) => ({
            personName: p.name,
            email,
            associationStrength: "DIRECT_LINK"
          }))
        )
      },
      sourceSignals,
      evidence: {
        sourceContributions: [
          ...entityGroup?.sourceContributions || [],
          ...input.candidates?.[0]?.sourceContributions || []
        ],
        evidenceReferences: evidencePack.items,
        conflicts: allConflicts,
        corroborations,
        evidencePack
      },
      qualification: qualificationAttachment,
      freshness: freshnessModel,
      quality,
      policy: policySummary,
      createdAt: firstObservedAt,
      updatedAt: lastObservedAt
    };
  }
  /**
   * Builds a CanonicalField<T> with explicit alternative lineage, conflict detection,
   * and deterministic precedence semantics.
   */
  buildCanonicalField(alternatives, fieldName, now, maxAgeDays, policyPreferredValue, equalityFn = (a, b) => a === b) {
    if (alternatives.length === 0) {
      return {
        value: void 0,
        preferredObservedValue: void 0,
        hasConflict: false,
        alternatives: [],
        conflicts: [],
        corroboratedBySources: [],
        corroborationCount: 0,
        provenance: "LEADNORIA_DERIVED",
        sourceContributions: [],
        firstObservedAt: now,
        lastObservedAt: now,
        freshnessState: "UNKNOWN",
        changeState: "UNKNOWN"
      };
    }
    const distinctAlternatives = [];
    for (const alt of alternatives) {
      if (!distinctAlternatives.some((da) => equalityFn(da.value, alt.value))) {
        distinctAlternatives.push(alt);
      }
    }
    const hasConflict = distinctAlternatives.length > 1;
    const conflicts = [];
    if (hasConflict) {
      conflicts.push({
        field: fieldName,
        conflictingValues: distinctAlternatives.map((da) => ({
          value: da.value,
          source: String(da.source),
          provenance: da.provenance,
          observedAt: da.observedAt,
          sourceUrl: da.sourceUrl
        })),
        reason: `Conflicting observations across sources for '${fieldName}' without identical matching values.`
      });
    }
    let preferredObservedValue = void 0;
    if (policyPreferredValue !== void 0) {
      preferredObservedValue = policyPreferredValue;
    } else if (distinctAlternatives.length === 1) {
      preferredObservedValue = distinctAlternatives[0].value;
    } else {
      preferredObservedValue = void 0;
    }
    const value = preferredObservedValue !== void 0 ? preferredObservedValue : alternatives[0].value;
    const sources = Array.from(new Set(alternatives.map((a) => a.source)));
    const provenances = Array.from(new Set(alternatives.map((a) => a.provenance)));
    const timestamps = alternatives.map((a) => a.observedAt).sort();
    const firstObservedAt = timestamps[0] || now;
    const lastObservedAt = timestamps[timestamps.length - 1] || now;
    return {
      value,
      preferredObservedValue,
      hasConflict,
      alternatives,
      conflicts,
      corroboratedBySources: sources,
      corroborationCount: sources.length,
      provenance: provenances.length > 1 ? "MIXED" : provenances[0] || "LEADNORIA_DERIVED",
      sourceContributions: alternatives.map((a) => ({
        source: a.source,
        provenance: a.provenance,
        fieldName,
        acquisitionContext: "LEADNORIA_INTERNAL",
        restrictionBasis: a.provenance === "GOOGLE_DERIVED" ? "GOOGLE_CONSUMER_WEB_RESTRICTED" : "NONE",
        isRestricted: a.provenance === "GOOGLE_DERIVED"
      })),
      firstObservedAt,
      lastObservedAt,
      freshnessState: this.computeFreshnessState(lastObservedAt, now, maxAgeDays),
      changeState: "OBSERVED"
    };
  }
  /**
   * Assembles canonical contacts, preserving field-level provenance and restrictions.
   */
  assembleContacts(input, now, maxAgeDays, globalPolicy) {
    const canonicalEmails = [];
    const canonicalPhones = [];
    if (input.googleCandidate?.phone) {
      const rawGPhone = input.googleCandidate.phone;
      const gDigits = normalizePhoneForComparison(rawGPhone);
      canonicalPhones.push({
        type: "PHONE",
        value: rawGPhone,
        normalizedValue: gDigits,
        preferredObservedValue: rawGPhone,
        hasConflict: false,
        alternatives: [{
          value: rawGPhone,
          source: "GOOGLE_MAPS",
          provenance: "GOOGLE_DERIVED",
          observedAt: input.googleCandidate.observedAt || now,
          sourceUrl: input.googleCandidate.mapsUrl,
          lineage: ["google-maps-raw-phone"]
        }],
        conflicts: [],
        isCorroborated: false,
        corroboratedBySources: ["GOOGLE_MAPS"],
        corroborationCount: 1,
        provenance: "GOOGLE_DERIVED",
        sourceContributions: [{
          source: "GOOGLE_MAPS",
          provenance: "GOOGLE_DERIVED",
          fieldName: "phone",
          acquisitionContext: "GOOGLE_CONSUMER_WEB",
          restrictionBasis: "GOOGLE_CONSUMER_WEB_RESTRICTED",
          isRestricted: true
        }],
        firstObservedAt: input.googleCandidate.observedAt || now,
        lastObservedAt: input.googleCandidate.observedAt || now,
        freshnessState: this.computeFreshnessState(input.googleCandidate.observedAt, now, maxAgeDays),
        changeState: "OBSERVED",
        isRestricted: true,
        exportEligible: false,
        persistenceEligible: false,
        associatedPersonNames: []
      });
    }
    const websitePhones = [
      ...(input.contactResult?.contacts || []).filter((c) => c.contactType === "PHONE"),
      ...(input.websiteResult?.phones || []).map((p) => ({
        rawValue: p.rawValue,
        normalizedValue: p.normalizedValue || p.rawValue,
        firstObservedAt: input.websiteResult?.observedAt || now,
        lastObservedAt: input.websiteResult?.observedAt || now,
        associatedPersonIds: []
      }))
    ];
    for (const wp of websitePhones) {
      const phoneVal = wp.rawValue || wp.normalizedValue;
      const digits = normalizePhoneForComparison(wp.normalizedValue || wp.rawValue);
      const existingGooglePhone = canonicalPhones.find((p) => p.normalizedValue === digits);
      if (existingGooglePhone) {
        existingGooglePhone.isCorroborated = true;
        if (!existingGooglePhone.corroboratedBySources.includes("WEBSITE")) {
          existingGooglePhone.corroboratedBySources.push("WEBSITE");
          existingGooglePhone.corroborationCount = existingGooglePhone.corroboratedBySources.length;
        }
        existingGooglePhone.alternatives.push({
          value: phoneVal,
          source: "WEBSITE",
          provenance: "WEBSITE_DERIVED",
          observedAt: wp.lastObservedAt || now,
          lineage: ["website-contact-fact"]
        });
      } else {
        canonicalPhones.push({
          type: "PHONE",
          value: phoneVal,
          normalizedValue: digits,
          preferredObservedValue: phoneVal,
          hasConflict: false,
          alternatives: [{
            value: phoneVal,
            source: "WEBSITE",
            provenance: "WEBSITE_DERIVED",
            observedAt: wp.lastObservedAt || now,
            lineage: ["website-contact-fact"]
          }],
          conflicts: [],
          isCorroborated: false,
          corroboratedBySources: ["WEBSITE"],
          corroborationCount: 1,
          provenance: "WEBSITE_DERIVED",
          sourceContributions: [{
            source: "WEBSITE",
            provenance: "WEBSITE_DERIVED",
            fieldName: "phone",
            acquisitionContext: "WEBSITE_DIRECT",
            restrictionBasis: "NONE",
            isRestricted: false
          }],
          firstObservedAt: wp.firstObservedAt || now,
          lastObservedAt: wp.lastObservedAt || now,
          freshnessState: this.computeFreshnessState(wp.lastObservedAt, now, maxAgeDays),
          changeState: "OBSERVED",
          isRestricted: false,
          exportEligible: true,
          persistenceEligible: true,
          associatedPersonNames: wp.associatedPersonIds || []
        });
      }
    }
    if (input.userOverride?.phone) {
      const userPhone = input.userOverride.phone;
      const uDigits = normalizePhoneForComparison(userPhone);
      canonicalPhones.unshift({
        type: "PHONE",
        value: userPhone,
        normalizedValue: uDigits,
        preferredObservedValue: userPhone,
        hasConflict: false,
        alternatives: [{
          value: userPhone,
          source: "USER_PROVIDED",
          provenance: "USER_PROVIDED",
          observedAt: input.userOverride.providedAt || now,
          lineage: ["user-override"]
        }],
        conflicts: [],
        isCorroborated: false,
        corroboratedBySources: ["USER_PROVIDED"],
        corroborationCount: 1,
        provenance: "USER_PROVIDED",
        sourceContributions: [{
          source: "USER_PROVIDED",
          provenance: "USER_PROVIDED",
          fieldName: "phone",
          acquisitionContext: "USER_INPUT",
          restrictionBasis: "NONE",
          isRestricted: false
        }],
        firstObservedAt: input.userOverride.providedAt || now,
        lastObservedAt: input.userOverride.providedAt || now,
        freshnessState: "CURRENT",
        changeState: "OBSERVED",
        isRestricted: false,
        exportEligible: true,
        persistenceEligible: true,
        associatedPersonNames: []
      });
    }
    const websiteEmails = [
      ...(input.contactResult?.contacts || []).filter((c) => c.contactType === "EMAIL"),
      ...(input.websiteResult?.emails || []).map((e) => ({
        rawValue: e.rawValue,
        normalizedValue: e.normalizedEmail || e.rawValue,
        firstObservedAt: input.websiteResult?.observedAt || now,
        lastObservedAt: input.websiteResult?.observedAt || now
      }))
    ];
    for (const we of websiteEmails) {
      const emailVal = we.rawValue || we.normalizedValue;
      canonicalEmails.push({
        type: "EMAIL",
        value: emailVal,
        normalizedValue: emailVal.toLowerCase().trim(),
        preferredObservedValue: emailVal,
        hasConflict: false,
        alternatives: [{
          value: emailVal,
          source: "WEBSITE",
          provenance: "WEBSITE_DERIVED",
          observedAt: we.lastObservedAt || now,
          lineage: ["website-contact-discovery"]
        }],
        conflicts: [],
        isCorroborated: false,
        corroboratedBySources: ["WEBSITE"],
        corroborationCount: 1,
        provenance: "WEBSITE_DERIVED",
        sourceContributions: [{
          source: "WEBSITE",
          provenance: "WEBSITE_DERIVED",
          fieldName: "email",
          acquisitionContext: "WEBSITE_DIRECT",
          restrictionBasis: "NONE",
          isRestricted: false
        }],
        firstObservedAt: we.firstObservedAt || now,
        lastObservedAt: we.lastObservedAt || now,
        freshnessState: this.computeFreshnessState(we.lastObservedAt, now, maxAgeDays),
        changeState: "OBSERVED",
        isRestricted: false,
        exportEligible: true,
        persistenceEligible: true,
        category: we.emailClassification === "ROLE_ACCOUNT" ? "OPERATIONAL_ROLE" : we.emailClassification === "PERSON_NAMED" ? "NAMED_INDIVIDUAL" : "GENERAL_INQUIRY",
        associatedPersonNames: we.associatedPersonIds || []
      });
    }
    if (input.userOverride?.email) {
      const uEmail = input.userOverride.email;
      canonicalEmails.unshift({
        type: "EMAIL",
        value: uEmail,
        normalizedValue: uEmail.toLowerCase().trim(),
        preferredObservedValue: uEmail,
        hasConflict: false,
        alternatives: [{
          value: uEmail,
          source: "USER_PROVIDED",
          provenance: "USER_PROVIDED",
          observedAt: input.userOverride.providedAt || now,
          lineage: ["user-override"]
        }],
        conflicts: [],
        isCorroborated: false,
        corroboratedBySources: ["USER_PROVIDED"],
        corroborationCount: 1,
        provenance: "USER_PROVIDED",
        sourceContributions: [{
          source: "USER_PROVIDED",
          provenance: "USER_PROVIDED",
          fieldName: "email",
          acquisitionContext: "USER_INPUT",
          restrictionBasis: "NONE",
          isRestricted: false
        }],
        firstObservedAt: input.userOverride.providedAt || now,
        lastObservedAt: input.userOverride.providedAt || now,
        freshnessState: "CURRENT",
        changeState: "OBSERVED",
        isRestricted: false,
        exportEligible: true,
        persistenceEligible: true,
        associatedPersonNames: []
      });
    }
    if (canonicalPhones.length > 1) {
      const uniqueDigits = Array.from(new Set(canonicalPhones.map((p) => p.normalizedValue)));
      if (uniqueDigits.length > 1) {
        const conflictRecord = {
          field: "phone",
          conflictingValues: canonicalPhones.map((p) => ({
            value: p.value,
            source: String(p.alternatives[0]?.source || "UNKNOWN"),
            provenance: p.provenance,
            observedAt: p.lastObservedAt
          })),
          reason: "Multiple conflicting phone numbers discovered across active sources."
        };
        for (const p of canonicalPhones) {
          p.hasConflict = true;
          p.conflicts.push(conflictRecord);
          if (!input.userOverride?.applyAsPreferred) {
            p.preferredObservedValue = void 0;
          }
        }
      }
    }
    if (input.previousSnapshot) {
      this.reconcileContactChanges(canonicalPhones, input.previousSnapshot.contacts.phones);
      this.reconcileContactChanges(canonicalEmails, input.previousSnapshot.contacts.emails);
    }
    return {
      canonicalEmails,
      canonicalPhones
    };
  }
  /**
   * Reconciles contacts against a previous snapshot to tag new, changed, or stale states.
   */
  reconcileContactChanges(currentContacts, previousContacts) {
    const prevMap = /* @__PURE__ */ new Map();
    for (const p of previousContacts) {
      prevMap.set(p.normalizedValue, p);
    }
    for (const c of currentContacts) {
      const prev = prevMap.get(c.normalizedValue);
      if (!prev) {
        c.changeState = "OBSERVED";
      } else {
        if (prev.value !== c.value) {
          c.changeState = "CHANGED";
        } else {
          c.changeState = "OBSERVED";
        }
      }
    }
    const currentValues = new Set(currentContacts.map((c) => c.normalizedValue));
    for (const prev of previousContacts) {
      if (!currentValues.has(prev.normalizedValue)) {
        currentContacts.push({
          ...prev,
          changeState: "NOT_OBSERVED_THIS_RUN",
          freshnessState: "STALE"
        });
      }
    }
  }
  /**
   * Assembles canonical people records from Phase 22 ContactIntelligenceResult.
   */
  assemblePeople(input, now, maxAgeDays, globalPolicy) {
    const peopleList = [];
    const sourcePeople = input.contactResult?.people || [];
    for (const sp of sourcePeople) {
      peopleList.push({
        personId: sp.personId,
        name: sp.fullName,
        canonicalName: sp.normalizedName,
        titles: sp.jobTitle ? [sp.jobTitle] : [],
        emails: [...sp.emailRefs || []],
        phones: [...sp.phoneRefs || []],
        linkedInUrl: void 0,
        socialUrls: (sp.socialRefs || []).map(sanitizeUrl).filter(Boolean).sort(),
        provenance: sp.provenance || "WEBSITE_DERIVED",
        sourceContributions: [...sp.sourceContributions || []],
        firstObservedAt: sp.firstObservedAt || now,
        lastObservedAt: sp.lastObservedAt || now,
        freshnessState: this.computeFreshnessState(sp.lastObservedAt, now, maxAgeDays),
        changeState: "OBSERVED",
        isRestricted: false,
        exportEligible: true,
        persistenceEligible: true
      });
    }
    if (input.previousSnapshot?.people?.publicPeople) {
      const currentIds = new Set(peopleList.map((p) => p.personId));
      for (const prevPerson of input.previousSnapshot.people.publicPeople) {
        if (!currentIds.has(prevPerson.personId)) {
          peopleList.push({
            ...prevPerson,
            changeState: "NOT_OBSERVED_THIS_RUN",
            freshnessState: "STALE"
          });
        }
      }
    }
    return peopleList.sort((a, b) => a.canonicalName.localeCompare(b.canonicalName));
  }
  /**
   * Constructs a compact, bounded evidence pack without storing raw HTML or dumps.
   */
  buildCompactEvidencePack(entityId, input, conflicts, corroborations, now) {
    const items = [];
    const sourceUrls = [];
    const sourceTypes = [];
    const addSource = (st, url) => {
      if (!sourceTypes.includes(st)) sourceTypes.push(st);
      if (url && !sourceUrls.includes(url)) sourceUrls.push(url);
    };
    if (input.googleCandidate) {
      addSource("GOOGLE_MAPS", input.googleCandidate.mapsUrl);
      items.push({
        evidenceId: `ev_google_${entityId}`,
        sourceType: "GOOGLE_MAPS",
        factType: "BUSINESS_LISTING",
        factSummary: `Google listing observed: ${input.googleCandidate.businessName || ""}`,
        sourceUrl: input.googleCandidate.mapsUrl,
        observedAt: input.googleCandidate.observedAt || now,
        provenance: "GOOGLE_DERIVED",
        isRestricted: true,
        fieldReferences: ["businessName", "address", "phone", "website"]
      });
    }
    if (input.metaCandidate) {
      addSource("META_AD_LIBRARY", input.metaCandidate.pageUrl);
      items.push({
        evidenceId: `ev_meta_${entityId}`,
        sourceType: "META_AD_LIBRARY",
        factType: "ADVERTISING_SIGNAL",
        factSummary: `Meta Ad Library observation with ${input.metaCandidate.adCount ?? 0} active ads`,
        sourceUrl: input.metaCandidate.pageUrl,
        observedAt: input.metaCandidate.observedAt || now,
        provenance: "META_DERIVED",
        isRestricted: false,
        fieldReferences: ["businessName", "pageUrl"]
      });
    }
    if (input.websiteResult) {
      addSource("WEBSITE", input.websiteResult.identity?.canonicalUrl);
      const pagesCount = input.websiteResult.crawlStats?.pagesVisited?.length || input.websiteResult.crawlStats?.pagesDiscovered || 1;
      items.push({
        evidenceId: `ev_web_${entityId}`,
        sourceType: "WEBSITE",
        factType: "WEBSITE_INTELLIGENCE",
        factSummary: `Website crawl: ${input.websiteResult.identity?.domain || ""}, ${pagesCount} pages verified`,
        sourceUrl: input.websiteResult.identity?.canonicalUrl,
        observedAt: input.websiteResult.observedAt || now,
        provenance: "WEBSITE_DERIVED",
        isRestricted: false,
        fieldReferences: ["website", "email", "phone", "services", "socialProfiles"]
      });
    }
    return {
      totalEvidenceCount: items.length,
      items,
      sourceUrls,
      sourceTypes,
      conflictCount: conflicts.length,
      corroborationCount: corroborations.length,
      entityResolutionId: entityId,
      qualificationProfileId: input.qualificationDecision?.profileId
    };
  }
  /**
   * Computes deterministic, descriptive completeness metrics (0.0 - 1.0).
   * Strictly no AI scoring, buyer scores, or intent probabilities.
   */
  computeQualitySummary(businessName, website, address, emails, phones, people, corroborations, conflicts) {
    let identityScore = 0;
    if (businessName.value) identityScore += 0.4;
    if (website.value) identityScore += 0.3;
    if (address.value) identityScore += 0.3;
    const businessScore = (businessName.value ? 0.5 : 0) + (address.value ? 0.5 : 0);
    let contactScore = 0;
    if (emails.length > 0) contactScore += 0.4;
    if (phones.length > 0) contactScore += 0.4;
    if (emails.length + phones.length > 2) contactScore += 0.2;
    const websiteScore = website.value ? 1 : 0;
    let personScore = 0;
    if (people.length > 0) personScore += 0.5;
    if (people.some((p) => p.titles.length > 0)) personScore += 0.25;
    if (people.some((p) => p.emails.length > 0 || p.phones.length > 0)) personScore += 0.25;
    const coverageScore = corroborations.length > 0 ? Math.min(1, 0.4 + corroborations.length * 0.3) : 0.4;
    return {
      identityCompleteness: Number(identityScore.toFixed(2)),
      businessCompleteness: Number(businessScore.toFixed(2)),
      contactCompleteness: Number(contactScore.toFixed(2)),
      websiteCompleteness: Number(websiteScore.toFixed(2)),
      evidenceCoverage: Number(coverageScore.toFixed(2)),
      publicPersonCompleteness: Number(personScore.toFixed(2)),
      contradictionCount: conflicts.length,
      corroborationCount: corroborations.length
    };
  }
  /**
   * Helper to compute freshness state based on maximum age days.
   */
  computeFreshnessState(timestamp, now = (/* @__PURE__ */ new Date()).toISOString(), maxAgeDays = 90) {
    if (!timestamp) return "UNKNOWN";
    try {
      const ts = new Date(timestamp).getTime();
      const current = new Date(now).getTime();
      if (isNaN(ts) || isNaN(current)) return "UNKNOWN";
      const ageDays = (current - ts) / (1e3 * 60 * 60 * 24);
      return ageDays <= maxAgeDays ? "CURRENT" : "STALE";
    } catch {
      return "UNKNOWN";
    }
  }
  /**
   * Converts a CanonicalLeadRecord into a UnifiedResearchRecord for Phase 16 ExportPolicy evaluation.
   */
  toUnifiedResearchRecord(record) {
    const isRestricted = record.policy.isRestricted;
    const persistenceEligible = record.policy.persistenceEligible;
    const exportEligible = record.policy.exportEligible;
    const sourceRecords = [];
    if (record.sourceSignals.googleEvidence) {
      sourceRecords.push({
        sourceType: "GOOGLE_MAPS",
        sourceNamespace: "google",
        sourceRecordId: record.sourceSignals.googleEvidence.placeId || record.canonicalEntityId
      });
    }
    if (record.sourceSignals.metaEvidence) {
      sourceRecords.push({
        sourceType: "META_AD_LIBRARY",
        sourceNamespace: "meta",
        sourceRecordId: record.sourceSignals.metaEvidence.pageId || record.canonicalEntityId
      });
    }
    if (record.sourceSignals.websiteEvidence) {
      sourceRecords.push({
        sourceType: "WEBSITE",
        sourceNamespace: "website",
        sourceRecordId: record.sourceSignals.websiteEvidence.domain
      });
    }
    if (sourceRecords.length === 0) {
      sourceRecords.push({
        sourceType: "USER_PROVIDED",
        sourceNamespace: "user",
        sourceRecordId: record.canonicalEntityId
      });
    }
    const fieldEligibility = {
      businessName: {
        isEligible: !isRestricted,
        sourceProvenance: record.canonicalBusinessName.provenance,
        restrictionBasis: isRestricted ? "GOOGLE_CONSUMER_WEB_RESTRICTED" : void 0
      },
      website: {
        isEligible: !isRestricted,
        sourceProvenance: record.digital.verifiedWebsite.provenance,
        restrictionBasis: isRestricted ? "GOOGLE_CONSUMER_WEB_RESTRICTED" : void 0
      },
      phone: {
        isEligible: !isRestricted,
        sourceProvenance: record.contacts.phones[0]?.provenance || "LEADNORIA_DERIVED",
        restrictionBasis: isRestricted ? "GOOGLE_CONSUMER_WEB_RESTRICTED" : void 0
      },
      email: {
        isEligible: !isRestricted,
        sourceProvenance: record.contacts.emails[0]?.provenance || "WEBSITE_DERIVED",
        restrictionBasis: isRestricted ? "GOOGLE_CONSUMER_WEB_RESTRICTED" : void 0
      },
      address: {
        isEligible: !isRestricted,
        sourceProvenance: record.location.normalizedAddress.provenance,
        restrictionBasis: isRestricted ? "GOOGLE_CONSUMER_WEB_RESTRICTED" : void 0
      }
    };
    const restrictions = {
      isRestricted,
      persistenceEligible,
      exportEligible,
      displayEligible: true,
      qualificationEligible: true,
      restrictionBasis: record.policy.restrictionBasis
    };
    const validPipelineSources = record.evidence.evidencePack.sourceTypes.filter((s) => s !== "LEADNORIA");
    return {
      recordId: `rec_${record.canonicalEntityId}`,
      entityId: record.canonicalEntityId,
      canonicalDisplayName: record.canonicalBusinessName.value || "",
      sourceRecords,
      primarySource: sourceRecords[0]?.sourceType || "USER_PROVIDED",
      sourceContributions: record.evidence.sourceContributions,
      provenance: record.policy.overallProvenance,
      restrictions,
      fieldEligibility,
      corroborationSources: validPipelineSources,
      corroborationCount: record.evidence.corroborations.length,
      stageStates: {
        SOURCE_PLANNING: "COMPLETED",
        SOURCE_EXECUTION: "COMPLETED",
        NORMALIZATION: "COMPLETED",
        ENTITY_RESOLUTION: "COMPLETED",
        EVIDENCE: "COMPLETED",
        RELEVANCE: "COMPLETED",
        WEBSITE_VERIFICATION: "COMPLETED",
        CONTACT_ENRICHMENT: "COMPLETED",
        QUALIFICATION: "COMPLETED",
        GEOGRAPHIC_ACCOUNTING: "COMPLETED",
        PERSISTENCE: persistenceEligible ? "COMPLETED" : "BLOCKED",
        EXPORT: exportEligible ? "COMPLETED" : "BLOCKED"
      },
      evidence: record.evidence.evidenceReferences,
      qualificationDecision: record.qualification.qualificationDecision,
      qualificationState: record.qualification.finalState,
      geographicObservations: [],
      diagnostics: {
        warnings: [],
        errors: [],
        notes: []
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }
  /**
   * Evaluates export eligibility for a CanonicalLeadRecord using the existing Phase 16 ExportPolicy.
   */
  evaluateExport(record) {
    const unifiedRecord = this.toUnifiedResearchRecord(record);
    return this.exportPolicy.evaluateRecord(unifiedRecord);
  }
  /**
   * Projects a CanonicalLeadRecord to export projection using the existing Phase 16 ExportProjection.
   */
  projectExport(record, evaluation) {
    const unifiedRecord = this.toUnifiedResearchRecord(record);
    const evalResult = evaluation || this.exportPolicy.evaluateRecord(unifiedRecord);
    return this.exportProjection.projectRecord(unifiedRecord, evalResult);
  }
};

// src/extension/acquisition/engine/types.ts
var DEFAULT_MAPS_SESSION_CONFIG = {
  sessionId: "",
  tabId: 0,
  maxCandidatesPerUnit: 50,
  maxScrollSteps: 15,
  navigationTimeoutMs: 15e3,
  readinessTimeoutMs: 1e4,
  renderWaitMs: 1200,
  maxRetriesPerUnit: 2,
  collectDetails: false
};
var DEFAULT_ACQUISITION_POLICY = {
  maxScrollSteps: 25,
  maxCandidates: 60,
  maxDurationMs: 6e4,
  scrollFractionOfViewport: 0.75,
  loadWaitTimeoutMs: 3e3,
  quietPeriodMs: 400,
  maxNoNewCandidateCycles: 3,
  retryLimit: 3,
  exhaustionTolerancePx: 30
};

// src/extension/acquisition/engine/stateMachine.ts
var IllegalStateTransitionError = class extends Error {
  constructor(fromState, toState, reason) {
    super(
      `Illegal Google Maps acquisition state transition: cannot transition from '${fromState}' to '${toState}'${reason ? ` (reason: ${reason})` : ""}`
    );
    this.name = "IllegalStateTransitionError";
    this.fromState = fromState;
    this.toState = toState;
    this.reason = reason;
  }
};
var LEGAL_TRANSITIONS = {
  IDLE: /* @__PURE__ */ new Set(["QUEUED", "STARTING", "CANCELLED"]),
  QUEUED: /* @__PURE__ */ new Set(["STARTING", "PAUSED", "CANCELLED"]),
  STARTING: /* @__PURE__ */ new Set(["NAVIGATING", "FAILED", "CANCELLED", "BLOCKED"]),
  NAVIGATING: /* @__PURE__ */ new Set(["OBSERVING", "PAUSED", "FAILED", "CANCELLED", "BLOCKED"]),
  OBSERVING: /* @__PURE__ */ new Set(["NAVIGATING", "PAUSED", "COMPLETING", "FAILED", "CANCELLED", "BLOCKED"]),
  PAUSED: /* @__PURE__ */ new Set(["STARTING", "NAVIGATING", "OBSERVING", "CANCELLED"]),
  COMPLETING: /* @__PURE__ */ new Set(["COMPLETED", "FAILED"]),
  COMPLETED: /* @__PURE__ */ new Set(["IDLE"]),
  CANCELLED: /* @__PURE__ */ new Set(["IDLE"]),
  FAILED: /* @__PURE__ */ new Set(["IDLE"]),
  BLOCKED: /* @__PURE__ */ new Set(["IDLE"])
};
var GoogleMapsStateMachine = class {
  constructor(sessionId, initialState = "IDLE") {
    this._pausedFromState = null;
    this._history = [];
    this._sessionId = sessionId;
    this._state = initialState;
  }
  get state() {
    return this._state;
  }
  get sessionId() {
    return this._sessionId;
  }
  get currentSearchUnitId() {
    return this._currentSearchUnitId;
  }
  get pausedFromState() {
    return this._pausedFromState;
  }
  setSearchUnitId(unitId) {
    this._currentSearchUnitId = unitId;
  }
  get history() {
    return this._history;
  }
  canTransitionTo(targetState) {
    const allowed = LEGAL_TRANSITIONS[this._state];
    return allowed ? allowed.has(targetState) : false;
  }
  transitionTo(targetState, reason) {
    if (this._state === targetState) {
      return {
        fromState: this._state,
        toState: targetState,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        reason: `No-op: already in state '${targetState}'`,
        sessionId: this._sessionId,
        searchUnitId: this._currentSearchUnitId
      };
    }
    if (!this.canTransitionTo(targetState)) {
      throw new IllegalStateTransitionError(this._state, targetState, reason);
    }
    const event = {
      fromState: this._state,
      toState: targetState,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      reason,
      sessionId: this._sessionId,
      searchUnitId: this._currentSearchUnitId
    };
    this._state = targetState;
    this._history.push(event);
    return event;
  }
  /**
   * Idempotent Pause:
   * Preserves the active operational state (NAVIGATING, OBSERVING, STARTING) in pausedFromState.
   * Returns true if transitioned to PAUSED, false if already PAUSED.
   */
  pause(reason = "Operator or queue paused acquisition") {
    if (this._state === "PAUSED") {
      return false;
    }
    this._pausedFromState = this._state;
    this.transitionTo("PAUSED", reason);
    return true;
  }
  /**
   * Safe Resume:
   * Only permitted from PAUSED. Transitions back to the operational state it was paused from,
   * or to an explicit legal targetState (OBSERVING, NAVIGATING, STARTING).
   */
  resume(targetState, reason = "Resumed from pause") {
    if (this._state !== "PAUSED") {
      throw new Error(`Cannot resume acquisition: current state is '${this._state}', expected 'PAUSED'`);
    }
    const resolvedTarget = targetState || (this._pausedFromState === "OBSERVING" || this._pausedFromState === "NAVIGATING" || this._pausedFromState === "STARTING" ? this._pausedFromState : "NAVIGATING");
    this._pausedFromState = null;
    return this.transitionTo(resolvedTarget, reason);
  }
  /**
   * Idempotent Cancel:
   * Returns true if transitioned to CANCELLED, false if already CANCELLED.
   */
  cancel(reason = "Operator or lifecycle cancelled acquisition") {
    if (this._state === "CANCELLED") {
      return false;
    }
    this._pausedFromState = null;
    this.transitionTo("CANCELLED", reason);
    return true;
  }
  /**
   * Reset back to IDLE (only valid from terminal states: COMPLETED, CANCELLED, FAILED, BLOCKED).
   */
  reset(reason = "Resetting session state to IDLE") {
    return this.transitionTo("IDLE", reason);
  }
};

// src/extension/acquisition/engine/acquisitionQueue.ts
var GoogleMapsAcquisitionQueue = class {
  constructor(initialUnits = []) {
    this._units = /* @__PURE__ */ new Map();
    this._order = [];
    this._activeUnitId = null;
    this._isPaused = false;
    this._isCancelled = false;
    this.enqueue(initialUnits);
  }
  /**
   * Enqueues one or more search units, suppressing duplicates deterministically.
   * Returns the count of newly accepted units.
   */
  enqueue(units) {
    if (this._isCancelled) {
      throw new Error("Cannot enqueue into a cancelled acquisition queue");
    }
    const arr = Array.isArray(units) ? units : [units];
    let accepted = 0;
    let duplicatesSuppressed = 0;
    for (const u of arr) {
      if (this._units.has(u.searchUnitId)) {
        duplicatesSuppressed++;
        continue;
      }
      u.status = "QUEUED";
      this._units.set(u.searchUnitId, u);
      this._order.push(u.searchUnitId);
      accepted++;
    }
    return { accepted, duplicatesSuppressed };
  }
  /**
   * Returns the currently active Search Unit if any.
   */
  getActiveUnit() {
    if (!this._activeUnitId) return null;
    return this._units.get(this._activeUnitId) ?? null;
  }
  /**
   * Claims the next QUEUED search unit for execution.
   * Enforces single-active-worker constraint: returns null if a unit is already active,
   * or if the queue is paused or cancelled.
   */
  claimNext() {
    if (this._isPaused || this._isCancelled) {
      return null;
    }
    if (this._activeUnitId) {
      return null;
    }
    for (const id of this._order) {
      const u = this._units.get(id);
      if (u && (u.status === "QUEUED" || u.status === "PLANNED")) {
        u.status = "IN_PROGRESS";
        u.startedAt = (/* @__PURE__ */ new Date()).toISOString();
        this._activeUnitId = u.searchUnitId;
        return u;
      }
    }
    return null;
  }
  /**
   * Marks the specified search unit as COMPLETED.
   */
  complete(searchUnitId, candidateCount = 0) {
    const u = this._units.get(searchUnitId);
    if (!u) return false;
    u.status = "COMPLETED";
    u.candidateCount = candidateCount;
    u.completedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (this._activeUnitId === searchUnitId) {
      this._activeUnitId = null;
    }
    return true;
  }
  /**
   * Records a failure for a search unit, automatically retrying if within maxRetries budget.
   */
  fail(searchUnitId, error, diagnostic) {
    const u = this._units.get(searchUnitId);
    if (!u) return { retried: false, terminal: false };
    u.lastError = error;
    if (diagnostic) {
      u.diagnostics.push(diagnostic);
    }
    if (this._activeUnitId === searchUnitId) {
      this._activeUnitId = null;
    }
    if (u.retryCount < u.maxRetries && !this._isCancelled) {
      u.retryCount++;
      u.status = "QUEUED";
      return { retried: true, terminal: false };
    }
    u.status = "FAILED";
    u.completedAt = (/* @__PURE__ */ new Date()).toISOString();
    return { retried: false, terminal: true };
  }
  /**
   * Pauses the queue. Ongoing unit is preserved in IN_PROGRESS or PAUSED.
   */
  pause() {
    this._isPaused = true;
    if (this._activeUnitId) {
      const u = this._units.get(this._activeUnitId);
      if (u) u.status = "PAUSED";
    }
  }
  /**
   * Resumes the queue.
   */
  resume() {
    if (this._isCancelled) {
      throw new Error("Cannot resume a cancelled queue");
    }
    this._isPaused = false;
    if (this._activeUnitId) {
      const u = this._units.get(this._activeUnitId);
      if (u && u.status === "PAUSED") u.status = "IN_PROGRESS";
    }
  }
  /**
   * Cancels the queue, terminating remaining queued units.
   */
  cancel() {
    this._isCancelled = true;
    for (const u of this._units.values()) {
      if (u.status === "QUEUED" || u.status === "PLANNED" || u.status === "IN_PROGRESS" || u.status === "PAUSED") {
        u.status = "CANCELLED";
        u.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      }
    }
    this._activeUnitId = null;
  }
  /**
   * Returns current queue progress breakdown.
   */
  getProgress() {
    let planned = 0;
    let queued = 0;
    let inProgress = 0;
    let completed = 0;
    let failed = 0;
    let cancelled = 0;
    for (const u of this._units.values()) {
      switch (u.status) {
        case "PLANNED":
          planned++;
          break;
        case "QUEUED":
          queued++;
          break;
        case "IN_PROGRESS":
        case "PAUSED":
          inProgress++;
          break;
        case "COMPLETED":
          completed++;
          break;
        case "FAILED":
          failed++;
          break;
        case "CANCELLED":
          cancelled++;
          break;
      }
    }
    return {
      total: this._units.size,
      planned,
      queued,
      inProgress,
      completed,
      failed,
      cancelled,
      activeUnitId: this._activeUnitId ?? void 0,
      isPaused: this._isPaused,
      isCancelled: this._isCancelled
    };
  }
  getUnit(searchUnitId) {
    return this._units.get(searchUnitId);
  }
  getAllUnits() {
    return this._order.map((id) => this._units.get(id)).filter(Boolean);
  }
};

// src/extension/acquisition/engine/pageDetector.ts
function isGoogleMapsUrl(urlStr) {
  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();
    const isGoogleDomain = host === "maps.google.com" || host.endsWith(".google.com") || /(^|\.)google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(host);
    if (!isGoogleDomain) return false;
    if (host === "maps.google.com") return true;
    return url.pathname.startsWith("/maps");
  } catch {
    return false;
  }
}
function classifyUrlPath(urlStr) {
  try {
    const url = new URL(urlStr);
    const path = url.pathname.toLowerCase();
    const q = url.searchParams.get("q");
    if (path.includes("/maps/search/") || path.startsWith("/maps") && !!q) {
      return { kind: "SEARCH_RESULTS", confidence: 0.85 };
    }
    if (path.includes("/maps/place/")) {
      return { kind: "PLACE_DETAIL", confidence: 0.9 };
    }
    if (path.includes("/maps/dir/")) {
      return { kind: "DIRECTIONS", confidence: 0.85 };
    }
    if (path === "/maps" || path === "/maps/" || path.startsWith("/maps/@")) {
      return { kind: "HOME_MAPS", confidence: 0.8 };
    }
    return { kind: "UNSUPPORTED", confidence: 0.5 };
  } catch {
    return { kind: "UNKNOWN", confidence: 0.1 };
  }
}
function evaluateSignals(urlStr, dom) {
  const isMaps = isGoogleMapsUrl(urlStr);
  if (!isMaps) {
    return {
      hasMapsHost: false,
      hasSearchPath: false,
      hasPlacePath: false,
      hasSearchInput: false,
      hasFeedContainer: false,
      hasDetailContainer: false,
      isLoadingSpinnerPresent: false,
      hasResultsHeader: false,
      hasNoResultsMarker: false,
      elementCount: 0
    };
  }
  let hasSearchPath = false;
  let hasPlacePath = false;
  try {
    const u = new URL(urlStr);
    hasSearchPath = u.pathname.includes("/maps/search/") || !!u.searchParams.get("q");
    hasPlacePath = u.pathname.includes("/maps/place/");
  } catch {
  }
  if (!dom) {
    return {
      hasMapsHost: true,
      hasSearchPath,
      hasPlacePath,
      hasSearchInput: false,
      hasFeedContainer: false,
      hasDetailContainer: false,
      isLoadingSpinnerPresent: false,
      hasResultsHeader: false,
      hasNoResultsMarker: false,
      elementCount: 0
    };
  }
  const searchInput = dom.querySelector('input#searchboxinput, input[aria-label*="Search"]');
  const feed = dom.querySelector('div[role="feed"], div[aria-label*="Results"], div[aria-label*="results"]');
  const detail = dom.querySelector('div[role="main"], h1.DUwDvf, [data-item-id="address"]');
  const spinner = dom.querySelector('div[role="progressbar"], div.m6QErb.loading, .G6jK8e');
  const noResults = dom.querySelector('div[role="feed"] div:has([aria-label*="No results"]), div.Q2vNVc, .widget-pane-no-results');
  const cardCount = dom.querySelectorAll ? dom.querySelectorAll('div[role="feed"] > div[jsaction], div[role="article"]').length : 0;
  return {
    hasMapsHost: true,
    hasSearchPath,
    hasPlacePath,
    hasSearchInput: !!searchInput,
    hasFeedContainer: !!feed,
    hasDetailContainer: !!detail,
    isLoadingSpinnerPresent: !!spinner,
    hasResultsHeader: !!feed,
    hasNoResultsMarker: !!noResults,
    elementCount: cardCount
  };
}
function detectGoogleMapsPage(urlStr, dom) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (!isGoogleMapsUrl(urlStr)) {
    return {
      isGoogleMaps: false,
      pageKind: "NON_GOOGLE",
      ready: false,
      confidence: 1,
      reason: "URL domain is outside Google Maps",
      url: urlStr,
      observedAt: now,
      signals: evaluateSignals(urlStr, dom)
    };
  }
  const signals = evaluateSignals(urlStr, dom);
  const urlClass = classifyUrlPath(urlStr);
  if (signals.isLoadingSpinnerPresent) {
    return {
      isGoogleMaps: true,
      pageKind: urlClass.kind,
      ready: false,
      confidence: 0.7,
      reason: "Loading progress bar or spinner is active in DOM",
      url: urlStr,
      observedAt: now,
      signals
    };
  }
  if (urlClass.kind === "SEARCH_RESULTS") {
    if (signals.hasNoResultsMarker) {
      return {
        isGoogleMaps: true,
        pageKind: "SEARCH_RESULTS",
        ready: true,
        confidence: 0.95,
        reason: "Search page ready: no results found for query",
        url: urlStr,
        observedAt: now,
        signals
      };
    }
    if (signals.hasFeedContainer || signals.elementCount > 0) {
      return {
        isGoogleMaps: true,
        pageKind: "SEARCH_RESULTS",
        ready: true,
        confidence: 0.98,
        reason: "Search results feed verified and rendered in DOM",
        url: urlStr,
        observedAt: now,
        signals
      };
    }
    if (dom && !signals.hasFeedContainer) {
      return {
        isGoogleMaps: true,
        pageKind: "SEARCH_RESULTS",
        ready: false,
        confidence: 0.65,
        reason: "Search URL loaded but feed container not yet detected in DOM",
        url: urlStr,
        observedAt: now,
        signals
      };
    }
    return {
      isGoogleMaps: true,
      pageKind: "SEARCH_RESULTS",
      ready: true,
      confidence: 0.85,
      reason: "Search results page confirmed via URL structure",
      url: urlStr,
      observedAt: now,
      signals
    };
  }
  if (urlClass.kind === "PLACE_DETAIL") {
    const ready = signals.hasDetailContainer || !dom;
    return {
      isGoogleMaps: true,
      pageKind: "PLACE_DETAIL",
      ready,
      confidence: ready ? 0.95 : 0.6,
      reason: ready ? "Place detail panel rendered and visible" : "Place detail URL loaded but detail container not rendered",
      url: urlStr,
      observedAt: now,
      signals
    };
  }
  if (urlClass.kind === "HOME_MAPS") {
    return {
      isGoogleMaps: true,
      pageKind: "HOME_MAPS",
      ready: true,
      confidence: 0.8,
      reason: "Google Maps home surface loaded without active search query",
      url: urlStr,
      observedAt: now,
      signals
    };
  }
  return {
    isGoogleMaps: true,
    pageKind: "UNSUPPORTED",
    ready: false,
    confidence: 0.5,
    reason: "Google Maps page is in an unsupported or unclassified layout state",
    url: urlStr,
    observedAt: now,
    signals
  };
}

// src/extension/acquisition/engine/navigationOrchestrator.ts
var GoogleMapsNavigationOrchestrator = class {
  constructor(driver, options = {}) {
    this._driver = driver;
    this._timeoutMs = options.timeoutMs ?? 15e3;
    this._pollIntervalMs = options.pollIntervalMs ?? 500;
  }
  /**
   * Verifies that the tab exists and belongs to a Google Maps surface or is eligible for navigation.
   */
  async validateTabOwnership(tabId, sessionId) {
    if (!tabId || tabId <= 0) {
      return {
        valid: false,
        diagnostic: {
          code: "MAPS_TAB_NOT_FOUND",
          severity: "P1",
          recoveryClass: "USER_ACTION_REQUIRED",
          message: "Invalid tab ID provided for Google Maps acquisition",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          sessionId
        }
      };
    }
    const tab = await this._driver.getTab(tabId);
    if (!tab) {
      return {
        valid: false,
        diagnostic: {
          code: "MAPS_TAB_NOT_FOUND",
          severity: "P1",
          recoveryClass: "USER_ACTION_REQUIRED",
          message: `Browser tab ${tabId} could not be found or was closed by user`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          sessionId
        }
      };
    }
    return { valid: true };
  }
  /**
   * Navigates the target tab to the Search Unit's Google Maps search URL,
   * then waits until the page is ready within the configured timeout.
   */
  async navigateToSearchUnit(tabId, searchUnit, sessionId) {
    const diagnostics = [];
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const ownership = await this.validateTabOwnership(tabId, sessionId);
    if (!ownership.valid) {
      if (ownership.diagnostic) diagnostics.push(ownership.diagnostic);
      return {
        success: false,
        url: searchUnit.navigationUrl,
        diagnostics,
        error: ownership.diagnostic?.message ?? "Invalid tab ownership"
      };
    }
    let navTriggered = false;
    try {
      navTriggered = await this._driver.navigateTab(tabId, searchUnit.navigationUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      diagnostics.push({
        code: "USER_NAVIGATION_INTERRUPTION",
        severity: "P1",
        recoveryClass: "RETRYABLE",
        message: `Tab navigation failed: ${msg}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId,
        searchUnitId: searchUnit.searchUnitId,
        url: searchUnit.navigationUrl
      });
      return { success: false, url: searchUnit.navigationUrl, diagnostics, error: msg };
    }
    if (!navTriggered) {
      diagnostics.push({
        code: "USER_NAVIGATION_INTERRUPTION",
        severity: "P1",
        recoveryClass: "RETRYABLE",
        message: "Tab driver rejected navigation request",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId,
        searchUnitId: searchUnit.searchUnitId,
        url: searchUnit.navigationUrl
      });
      return { success: false, url: searchUnit.navigationUrl, diagnostics, error: "Navigation rejected" };
    }
    const startTime = Date.now();
    let lastDetection;
    while (Date.now() - startTime < this._timeoutMs) {
      const currentTab = await this._driver.getTab(tabId);
      if (!currentTab) {
        diagnostics.push({
          code: "MAPS_TAB_NOT_FOUND",
          severity: "P1",
          recoveryClass: "USER_ACTION_REQUIRED",
          message: "Target Google Maps tab was closed during navigation wait",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          sessionId,
          searchUnitId: searchUnit.searchUnitId
        });
        return { success: false, url: searchUnit.navigationUrl, diagnostics, error: "Tab closed" };
      }
      if (currentTab.url && currentTab.url !== "about:blank" && !isGoogleMapsUrl(currentTab.url)) {
        diagnostics.push({
          code: "USER_NAVIGATION_INTERRUPTION",
          severity: "P1",
          recoveryClass: "USER_ACTION_REQUIRED",
          message: `User or script navigated away to non-Google URL: ${currentTab.url}`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          sessionId,
          searchUnitId: searchUnit.searchUnitId,
          url: currentTab.url
        });
        return { success: false, url: currentTab.url, diagnostics, error: "Navigated away" };
      }
      try {
        if (typeof this._driver.probeTabState === "function") {
          lastDetection = await this._driver.probeTabState(tabId);
          if (lastDetection.ready && lastDetection.pageKind === "SEARCH_RESULTS") {
            return {
              success: true,
              url: currentTab.url,
              pageDetection: lastDetection,
              diagnostics
            };
          }
        } else {
          return {
            success: true,
            url: currentTab.url,
            diagnostics
          };
        }
      } catch {
      }
      await new Promise((r) => setTimeout(r, this._pollIntervalMs));
    }
    diagnostics.push({
      code: "NAVIGATION_TIMEOUT",
      severity: "P1",
      recoveryClass: "RETRYABLE",
      message: `Google Maps failed to reach ready state within ${this._timeoutMs}ms`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      sessionId,
      searchUnitId: searchUnit.searchUnitId,
      url: searchUnit.navigationUrl,
      details: {
        lastReason: lastDetection?.reason ?? "Unknown readiness delay",
        confidence: lastDetection?.confidence ?? 0
      }
    });
    return {
      success: false,
      url: searchUnit.navigationUrl,
      pageDetection: lastDetection,
      diagnostics,
      error: `Navigation timeout after ${this._timeoutMs}ms`
    };
  }
};

// src/extension/acquisition/engine/observationBoundary.ts
var ENGINE_ADAPTER_VERSION = "2.0.0-foundation";
function cleanDomText(text) {
  if (text === null || text === void 0) return void 0;
  const str = typeof text === "string" ? text : String(text);
  const s = str.replace(/[\x00-\x1F\x7F]/g, " ").replace(/\s+/g, " ").trim();
  return s.length > 0 ? s.slice(0, 500) : void 0;
}
function cleanDomUrl(raw) {
  if (!raw || typeof raw !== "string") return void 0;
  const s = raw.trim();
  if (s.toLowerCase().startsWith("javascript:") || s.toLowerCase().startsWith("data:")) {
    return void 0;
  }
  try {
    const parsed = new URL(s);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    if (s.startsWith("/maps/place/") || s.startsWith("https://www.google.com/maps/place/")) {
      return s;
    }
  }
  return void 0;
}
function buildObservedField(rawValue, parsedValue, availability, confidence, sourceSignal, diagnosticReason) {
  return {
    availability,
    rawValue,
    parsedValue,
    confidence,
    sourceSignal,
    diagnosticReason
  };
}
function evaluateRatingField(rawRating, surfaceType = "CARD") {
  if (rawRating === void 0) {
    if (surfaceType === "EXTERNAL") {
      return buildObservedField(void 0, void 0, "UNSUPPORTED", 0.8, void 0, "Rating not available on external surface");
    }
    return buildObservedField(void 0, void 0, "UNKNOWN", 0.85, void 0, "Rating element not visible or omitted on observation surface (presence unknown)");
  }
  const cleaned = cleanDomText(rawRating);
  if (!cleaned) {
    return buildObservedField(rawRating, void 0, "UNKNOWN", 0.5, void 0, "Rating element present but empty text");
  }
  if (/(no reviews|unrated|no rating|not rated|no reviews yet)/i.test(cleaned)) {
    return buildObservedField(cleaned, void 0, "ABSENT", 0.95, "rating-badge", "Explicit evidence indicates business has no rating");
  }
  if (/[$€£৳¥]/.test(cleaned)) {
    return buildObservedField(rawRating, void 0, "AMBIGUOUS", 0.3, void 0, "Contains price currency tokens rather than rating");
  }
  const match = cleaned.match(/(\d+[.,]\d+|\b[1-5]\b)/);
  if (!match) {
    return buildObservedField(rawRating, void 0, "AMBIGUOUS", 0.4, void 0, `Unparseable rating text: "${cleaned}"`);
  }
  const val = parseFloat(match[1].replace(",", "."));
  if (isNaN(val) || val < 1 || val > 5) {
    return buildObservedField(rawRating, void 0, "AMBIGUOUS", 0.3, void 0, `Rating value out of valid 1-5 range: ${val}`);
  }
  return buildObservedField(cleaned, Math.round(val * 10) / 10, "PRESENT", 0.95, "rating-badge");
}
function evaluateReviewCountField(rawReviews, surfaceType = "CARD") {
  if (rawReviews === void 0) {
    if (surfaceType === "EXTERNAL") {
      return buildObservedField(void 0, void 0, "UNSUPPORTED", 0.8, void 0, "Review count not available on external surface");
    }
    return buildObservedField(void 0, void 0, "UNKNOWN", 0.85, void 0, "Review count not visible on observation surface (presence unknown)");
  }
  const cleaned = cleanDomText(rawReviews);
  if (!cleaned) {
    return buildObservedField(rawReviews, void 0, "UNKNOWN", 0.5, void 0, "Review count element empty");
  }
  if (/(no reviews|\b0 reviews\b|\b0\b|no reviews yet|zero reviews)/i.test(cleaned)) {
    return buildObservedField(cleaned, 0, "ABSENT", 0.95, "review-count-badge", "Explicit evidence indicates zero/no reviews");
  }
  if (/\b(km|mi|m|meters|miles)\b/i.test(cleaned)) {
    return buildObservedField(rawReviews, void 0, "AMBIGUOUS", 0.3, void 0, "Contains distance unit rather than review count");
  }
  if (/[$€£৳¥]/.test(cleaned)) {
    return buildObservedField(rawReviews, void 0, "AMBIGUOUS", 0.3, void 0, "Contains currency symbol rather than review count");
  }
  const kMatch = cleaned.match(/([\d]+[.,]\d+|\d+)\s*[kK]/);
  if (kMatch) {
    const base = parseFloat(kMatch[1].replace(",", "."));
    if (!isNaN(base)) {
      const count2 = Math.round(base * 1e3);
      return buildObservedField(cleaned, count2, "PRESENT", 0.95, "review-count-badge");
    }
  }
  const digitsMatch = cleaned.replace(/[(),]/g, "").match(/\b\d+\b/);
  if (!digitsMatch) {
    return buildObservedField(rawReviews, void 0, "AMBIGUOUS", 0.4, void 0, `Unparseable review count text: "${cleaned}"`);
  }
  const count = parseInt(digitsMatch[0], 10);
  if (count === 0) {
    return buildObservedField(cleaned, 0, "ABSENT", 0.95, "review-count-badge", "Explicit zero reviews observed");
  }
  return buildObservedField(cleaned, count, "PRESENT", 0.95, "review-count-badge");
}
function evaluateWebsiteField(rawUrl, surfaceInspected = true, surfaceType) {
  if (!surfaceInspected) {
    return buildObservedField(void 0, void 0, "UNSUPPORTED", 0.9, void 0, "Surface does not support website inspection");
  }
  if (rawUrl === void 0) {
    if (surfaceType === "CARD") {
      return buildObservedField(void 0, void 0, "UNKNOWN", 0.85, void 0, "Website not shown on result card surface (presence unknown)");
    }
    return buildObservedField(void 0, void 0, "ABSENT", 0.95, void 0, "Inspection completed; no website link present");
  }
  const cleaned = cleanDomUrl(rawUrl);
  if (!cleaned) {
    return buildObservedField(rawUrl, void 0, "UNKNOWN", 0.5, void 0, "Website attribute present but invalid URL structure");
  }
  if (cleaned.includes("google.com/maps") || cleaned.includes("google.com/search")) {
    return buildObservedField(rawUrl, void 0, "ABSENT", 0.9, void 0, "Authority website points to internal Google URL");
  }
  return buildObservedField(rawUrl, cleaned, "PRESENT", 0.95, "authority-anchor");
}
function evaluateTextField(rawText, fieldName = "field", surfaceType = "CARD") {
  if (rawText === void 0) {
    if (surfaceType === "EXTERNAL") {
      return buildObservedField(void 0, void 0, "UNSUPPORTED", 0.8, void 0, `${fieldName} not available on external surface`);
    }
    if (surfaceType === "CARD") {
      return buildObservedField(void 0, void 0, "UNKNOWN", 0.85, void 0, `${fieldName} not visible on result card surface (presence unknown)`);
    }
    return buildObservedField(void 0, void 0, "ABSENT", 0.9, void 0, `No ${fieldName} element detected on inspected detail surface`);
  }
  const cleaned = cleanDomText(rawText);
  if (!cleaned) {
    return buildObservedField(rawText, void 0, "UNKNOWN", 0.5, void 0, `${fieldName} element present but text empty`);
  }
  return buildObservedField(rawText, cleaned, "PRESENT", 0.95, `${fieldName}-node`);
}
function createCandidateObservation(raw, context) {
  const now = context.observedAt || (/* @__PURE__ */ new Date()).toISOString();
  const surfaceType = raw.surfaceType ?? (raw.isDetail ? "DETAIL" : "CARD");
  const nameField = evaluateTextField(raw.businessName, "businessName", surfaceType);
  const catField = evaluateTextField(raw.category, "category", surfaceType);
  const addrField = evaluateTextField(raw.address, "address", surfaceType);
  const phoneField = evaluateTextField(raw.phone, "phone", surfaceType);
  const webField = evaluateWebsiteField(raw.websiteUrl, true, surfaceType);
  const ratingField = evaluateRatingField(raw.rating, surfaceType);
  const revField = evaluateReviewCountField(raw.reviewCount, surfaceType);
  const statusField = evaluateTextField(raw.businessStatus, "businessStatus", surfaceType);
  const placeIdField = evaluateTextField(raw.placeId, "placeId", surfaceType);
  const mapsUrlField = evaluateTextField(raw.mapsUrl, "mapsUrl", surfaceType);
  const idSeed = `${context.searchUnitId}::${raw.placeId || raw.businessName || "unknown"}::${raw.address || ""}`;
  const observationId = `gmo_${hashStringDeterministic(idSeed)}`;
  const fieldAvailability = {
    businessName: nameField.availability,
    category: catField.availability,
    address: addrField.availability,
    phone: phoneField.availability,
    websiteUrl: webField.availability,
    rating: ratingField.availability,
    reviewCount: revField.availability,
    businessStatus: statusField.availability,
    placeId: placeIdField.availability,
    mapsUrl: mapsUrlField.availability
  };
  const diagnostics = [];
  if (nameField.availability !== "PRESENT") {
    diagnostics.push({
      code: "CANDIDATE_OBSERVATION_FAILED",
      severity: "P1",
      recoveryClass: "RECOVERABLE",
      message: "Candidate observed without valid business name",
      timestamp: now,
      searchUnitId: context.searchUnitId,
      sessionId: context.sessionId
    });
  }
  return {
    observationId,
    searchUnitId: context.searchUnitId,
    sessionId: context.sessionId,
    source: "GOOGLE_MAPS_BROWSER",
    observedAt: now,
    pageUrl: context.pageUrl,
    pageKind: context.pageKind,
    businessName: nameField,
    category: catField,
    address: addrField,
    phone: phoneField,
    websiteUrl: webField,
    rating: ratingField,
    reviewCount: revField,
    businessStatus: statusField,
    placeId: placeIdField,
    mapsUrl: mapsUrlField,
    searchKeyword: context.searchKeyword,
    searchLocation: context.searchLocation,
    provenance: {
      source: "GOOGLE_MAPS_BROWSER",
      acquisitionContext: "BROWSER_RENDERED_DOM",
      isRestricted: true,
      policyStatus: "POLICY_GATED",
      persistenceStatus: "NOT_PERSISTABLE",
      exportStatus: "NOT_EXPORTABLE",
      adapterVersion: ENGINE_ADAPTER_VERSION,
      extractionMethod: "RENDERED_DOM_OBSERVATION",
      searchUnitId: context.searchUnitId,
      sessionId: context.sessionId,
      observedAt: now,
      pageUrl: context.pageUrl
    },
    fieldAvailability,
    diagnostics
  };
}

// src/extension/acquisition/engine/checkpointManager.ts
var InMemoryCheckpointStorage = class {
  constructor() {
    this._storage = /* @__PURE__ */ new Map();
  }
  async saveCheckpoint(checkpoint) {
    this._storage.set(checkpoint.sessionId, checkpoint);
  }
  async loadCheckpoint(sessionId) {
    return this._storage.get(sessionId) ?? null;
  }
  async clearCheckpoint(sessionId) {
    this._storage.delete(sessionId);
  }
};
var GoogleMapsCheckpointManager = class {
  constructor(storage = new InMemoryCheckpointStorage()) {
    this._storage = storage;
  }
  /**
   * Captures an ephemeral metadata checkpoint for the active session and search unit.
   */
  async createCheckpoint(params) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const checkpointSeed = `${params.sessionId}::${params.searchUnit.searchUnitId}::${now}`;
    const checkpointId = `gcp_${hashStringDeterministic(checkpointSeed)}`;
    const checkpoint = {
      checkpointId,
      sessionId: params.sessionId,
      searchUnitId: params.searchUnit.searchUnitId,
      state: params.state,
      pageUrl: params.pageUrl,
      candidateCount: params.searchUnit.candidateCount,
      lastObservedCandidateSignature: params.lastObservedCandidateSignature,
      lastObservedCandidateIdentity: params.lastObservedCandidateIdentity,
      lastObservedCandidateEvidence: params.lastObservedCandidateEvidence,
      resultSurfacePosition: params.resultSurfacePosition,
      observationSequence: params.observationSequence,
      searchUnitProgressContext: params.searchUnitProgressContext,
      checkpointToken: params.checkpointToken ?? `tok_${checkpointId}`,
      duplicateSuppressionContext: params.duplicateSuppressionContext,
      progress: params.progress,
      retryCount: params.searchUnit.retryCount,
      timestamp: now,
      adapterVersion: ENGINE_ADAPTER_VERSION,
      diagnosticsSummary: params.diagnosticsSummary ?? {
        warningCount: 0,
        errorCount: 0
      }
    };
    await this._storage.saveCheckpoint(checkpoint);
    return checkpoint;
  }
  /**
   * Loads the latest checkpoint for the given session.
   */
  async loadCheckpoint(sessionId) {
    return this._storage.loadCheckpoint(sessionId);
  }
  /**
   * Validates a checkpoint for resumption integrity.
   */
  validateCheckpoint(checkpoint) {
    if (!checkpoint) {
      return { valid: false, reason: "Checkpoint does not exist" };
    }
    if (!checkpoint.sessionId || !checkpoint.searchUnitId) {
      return { valid: false, reason: "Malformed checkpoint: missing sessionId or searchUnitId" };
    }
    if (checkpoint.state === "CANCELLED") {
      return { valid: false, reason: "Cannot resume from a CANCELLED checkpoint" };
    }
    if (checkpoint.state === "COMPLETED") {
      return { valid: false, reason: "Session already completed" };
    }
    return { valid: true };
  }
  /**
   * Cleans up checkpoint on session completion or cancellation.
   */
  async clearCheckpoint(sessionId) {
    await this._storage.clearCheckpoint(sessionId);
  }
};

// src/extension/acquisition/engine/messageContracts.ts
function validateAcquisitionMessage(msg) {
  if (!msg || typeof msg !== "object") {
    return { valid: false, error: "Message must be a non-null object" };
  }
  const m = msg;
  if (typeof m.type !== "string") {
    return { valid: false, error: 'Message must have a string "type" field' };
  }
  if (m.source !== "GMAPS_ENGINE") {
    return { valid: false, error: 'Message source must be "GMAPS_ENGINE"' };
  }
  const validTypes = /* @__PURE__ */ new Set([
    "START_GMAPS_ACQUISITION",
    "PAUSE_GMAPS_ACQUISITION",
    "RESUME_GMAPS_ACQUISITION",
    "CANCEL_GMAPS_ACQUISITION",
    "GET_GMAPS_ACQUISITION_STATUS",
    "EXECUTE_GMAPS_FEED_SCROLL",
    "PROBE_GMAPS_LIVE_CAPABILITY",
    "SET_GMAPS_FILTER",
    "RESET_GMAPS_FILTER",
    "GET_GMAPS_FILTERED_VIEW",
    "START_GMAPS_BULK_RESEARCH",
    "PAUSE_GMAPS_BULK_RESEARCH",
    "RESUME_GMAPS_BULK_RESEARCH",
    "CANCEL_GMAPS_BULK_RESEARCH",
    "GET_GMAPS_BULK_RESEARCH_STATUS",
    "GMAPS_ACQUISITION_STATUS_UPDATED",
    "GMAPS_CANDIDATES_OBSERVED",
    "GMAPS_ACQUISITION_DIAGNOSTIC"
  ]);
  if (!validTypes.has(m.type)) {
    return { valid: false, error: `Unknown message type: "${m.type}"` };
  }
  const isBulkType = typeof m.type === "string" && m.type.includes("_BULK_");
  let payload = m.payload;
  if (!payload || typeof payload !== "object") {
    if (m.type === "GET_GMAPS_BULK_RESEARCH_STATUS" || isBulkType) {
      payload = {};
      m.payload = payload;
    } else {
      return { valid: false, error: 'Message must have a "payload" object' };
    }
  }
  if (!isBulkType && (!payload.sessionId || typeof payload.sessionId !== "string")) {
    return { valid: false, error: 'Message payload must include a "sessionId" string' };
  }
  return { valid: true, message: msg };
}

// src/extension/acquisition/engine/cardDetector.ts
var CARD_SELECTORS = {
  // Candidate card containers within feed
  cardContainers: [
    'div[role="feed"] > div[jsaction]',
    'div[role="feed"] > div[role="article"]',
    'div[role="article"]',
    'div[jsaction*="mouseover"]:has(a[href*="/maps/place/"])',
    "div.Nv2PK",
    // Common Maps result item class fallback
    'div[jsaction*="pane.wfvdle"]'
  ],
  // Business Name
  name: [
    ".qBF1Pd",
    '[class*="fontHeadlineSmall"]',
    "h3",
    ".NrDZNb",
    '[role="heading"]',
    'a[href*="/maps/place/"] div[class*="fontHeadline"]',
    "div.fontHeadlineSmall"
  ],
  // Listing / Maps Place link
  placeLink: [
    "a.hfpxzc",
    'a[class*="hfpxzc"]',
    'a[href*="/maps/place/"]',
    'a[href*="google.com/maps/place/"]',
    'a[data-item-id*="address"]',
    'a[jsaction*="pane.wfvdle"]'
  ],
  // Rating & Review indicators
  rating: [
    'span[aria-label*="star"]',
    'span[aria-label*="rated"]',
    'span[aria-label*="Rated"]',
    "span.MW4etd",
    'span[aria-hidden="true"]:has(+ span[aria-label*="reviews"])'
  ],
  reviews: [
    'span[aria-label*="review"]',
    'span[aria-label*="Review"]',
    ".UY7F9",
    ".e4rVHe",
    "span.ZDNAVf"
  ],
  // Category and Address lines
  textSnippets: [
    ".W4Efsd span",
    ".GHT2ce span",
    'div[class*="fontBodyMedium"] span',
    "div.W4Efsd"
  ],
  // Business status indicators
  status: [
    ".YhemCb",
    '[aria-label*="Closed"]',
    '[aria-label*="Open"]',
    'span[style*="color: rgb(217, 48, 37)"]',
    // Red text (closed)
    'span[style*="color: rgb(24, 128, 56)"]'
    // Green text (open)
  ],
  // Non-business UI / Placeholder markers
  loadingPlaceholders: [
    '[class*="skeleton"]',
    '[class*="placeholder"]',
    '.m6QErb.tLzqyd[aria-label*="Loading"]',
    'div[aria-busy="true"]'
  ],
  adMarkers: [
    'span[aria-label*="Sponsored"]',
    'span[aria-label*="Ad"]',
    ".k8D6id",
    'span:contains("Sponsored")',
    "[data-ad-slot]"
  ]
};
function parsePlaceIdFromUrl(url) {
  if (!url) return void 0;
  const chijMatch = url.match(/(ChIJ[A-Za-z0-9_-]{20,})/);
  if (chijMatch) return chijMatch[1];
  const tokenMatch = url.match(/!1s([^!/?&#]+)/);
  if (tokenMatch) return tokenMatch[1];
  const genericHex = url.match(/(0x[0-9a-zA-Z_-]+:0x[0-9a-zA-Z_-]+)/);
  if (genericHex) return genericHex[1];
  return void 0;
}
function extractText(el) {
  if (!el || !el.textContent) return void 0;
  const s = el.textContent.replace(/[\x00-\x1F\x7F]/g, " ").replace(/\s+/g, " ").trim();
  return s.length > 0 ? s : void 0;
}
function classifyCandidateCard(el) {
  if (!el) {
    return {
      element: el,
      classification: "INVALID_UNKNOWN",
      confidence: 0,
      reason: "Null or undefined element",
      isBusinessCard: false
    };
  }
  if (el.getAttribute && (el.getAttribute("aria-busy") === "true" || el.getAttribute("data-loading") === "true")) {
    return {
      element: el,
      classification: "LOADING_PLACEHOLDER",
      confidence: 0.9,
      reason: "Element is an active loading skeleton/placeholder",
      isBusinessCard: false
    };
  }
  const rawText = el.textContent || "";
  if (rawText.trim().length === 0) {
    return {
      element: el,
      classification: "LOADING_PLACEHOLDER",
      confidence: 0.85,
      reason: "Card has zero text content (empty placeholder/skeleton)",
      isBusinessCard: false
    };
  }
  const role = el.getAttribute ? el.getAttribute("role") : void 0;
  if (role === "button" || role === "tab" || role === "menubar" || role === "navigation") {
    return {
      element: el,
      classification: "NON_BUSINESS_UI",
      confidence: 0.95,
      reason: `Element has non-card role="${role}"`,
      isBusinessCard: false
    };
  }
  let foundName;
  if (el.querySelector) {
    for (const sel of CARD_SELECTORS.name) {
      try {
        const nameEl = el.querySelector(sel);
        const txt = extractText(nameEl);
        if (txt && txt.length > 0 && txt.length < 200) {
          foundName = txt;
          break;
        }
      } catch {
      }
    }
  }
  if (!foundName && el.querySelector) {
    const heading = el.querySelector('h3, h2, [role="heading"], strong');
    const txt = extractText(heading);
    if (txt && txt.length > 1 && txt.length < 200) {
      foundName = txt;
    }
  }
  if (!foundName) {
    return {
      element: el,
      classification: "INVALID_UNKNOWN",
      confidence: 0.8,
      reason: "No recognizable business name heading or text found",
      isBusinessCard: false
    };
  }
  let isSponsored = false;
  const lowerText = rawText.toLowerCase();
  if (lowerText.startsWith("sponsored") || lowerText.includes("\xB7 sponsored") || lowerText.includes(" ad \xB7")) {
    isSponsored = true;
  }
  if (!isSponsored && el.querySelector) {
    for (const sel of CARD_SELECTORS.adMarkers) {
      try {
        if (el.querySelector(sel)) {
          isSponsored = true;
          break;
        }
      } catch {
      }
    }
  }
  let hasSupportingEvidence = false;
  if (el.querySelector) {
    for (const sel of CARD_SELECTORS.placeLink) {
      try {
        if (el.querySelector(sel)) {
          hasSupportingEvidence = true;
          break;
        }
      } catch {
      }
    }
    if (!hasSupportingEvidence) {
      for (const sel of CARD_SELECTORS.rating) {
        try {
          if (el.querySelector(sel)) {
            hasSupportingEvidence = true;
            break;
          }
        } catch {
        }
      }
    }
  }
  if (foundName.length >= 1) {
    if (isSponsored) {
      return {
        element: el,
        classification: "AD_OR_PROMOTIONAL_UI",
        confidence: 0.85,
        reason: `Sponsored business listing: "${foundName}"`,
        isBusinessCard: true
      };
    }
    return {
      element: el,
      classification: "VALID_BUSINESS_CANDIDATE",
      confidence: hasSupportingEvidence ? 0.95 : 0.75,
      reason: `Valid business card with name "${foundName}"`,
      isBusinessCard: true
    };
  }
  return {
    element: el,
    classification: "INVALID_UNKNOWN",
    confidence: 0.7,
    reason: "Insufficient business identity evidence",
    isBusinessCard: false
  };
}
function extractRawCardNodeData(cardEl, pageUrl = "") {
  const result = {};
  if (!cardEl.querySelector) {
    return result;
  }
  for (const sel of CARD_SELECTORS.name) {
    try {
      const el = cardEl.querySelector(sel);
      const txt = extractText(el);
      if (txt) {
        result.businessName = txt;
        break;
      }
    } catch {
    }
  }
  for (const sel of CARD_SELECTORS.placeLink) {
    try {
      const linkEl = cardEl.querySelector(sel);
      if (linkEl && linkEl.getAttribute) {
        const href = linkEl.getAttribute("href");
        if (href) {
          result.mapsUrl = href;
          const pid = parsePlaceIdFromUrl(href);
          if (pid) {
            result.placeId = pid;
          }
          break;
        }
      }
    } catch {
    }
  }
  for (const sel of CARD_SELECTORS.rating) {
    try {
      const ratingEl = cardEl.querySelector(sel);
      if (ratingEl) {
        const aria = ratingEl.getAttribute ? ratingEl.getAttribute("aria-label") : void 0;
        const txt = aria || ratingEl.textContent || "";
        const match = txt.match(/(\d+[.,]\d+|\b[1-5]\b)/);
        if (match) {
          result.rating = match[1];
          break;
        }
      }
    } catch {
    }
  }
  for (const sel of CARD_SELECTORS.reviews) {
    try {
      const reviewEl = cardEl.querySelector(sel);
      if (reviewEl) {
        const aria = reviewEl.getAttribute ? reviewEl.getAttribute("aria-label") : void 0;
        const txt = aria || reviewEl.textContent || "";
        const match = txt.match(/([\d]+[.,]\d+|\d+)\s*[kK]?/);
        if (match) {
          result.reviewCount = match[0];
          break;
        }
      }
    } catch {
    }
  }
  if (cardEl.querySelectorAll) {
    try {
      const snippetNodes = cardEl.querySelectorAll(CARD_SELECTORS.textSnippets.join(", "));
      const textSnippets = [];
      for (let i = 0; i < snippetNodes.length && i < 12; i++) {
        const txt = extractText(snippetNodes[i]);
        if (txt && !textSnippets.includes(txt)) {
          textSnippets.push(txt);
        }
      }
      for (const line of textSnippets) {
        if (/^\d+[.,]?\d*$/.test(line) || line.includes("\u2605") || line.includes("reviews") || line.includes("review")) {
          continue;
        }
        const lower = line.toLowerCase();
        if (lower.includes("closed") || lower.includes("open") || lower.includes("opens") || lower.includes("closing")) {
          if (!result.businessStatus) {
            result.businessStatus = line;
          }
          continue;
        }
        if (/\+?\d[\d\s\-()]{7,}\d/.test(line) && !result.phone) {
          result.phone = line;
          continue;
        }
        if (!result.category && line.length < 60 && !line.includes(",") && !/\d{3,}/.test(line)) {
          result.category = line;
        } else if (!result.address && (line.includes(",") || /\d/.test(line) || line.length >= 10)) {
          result.address = line;
        }
      }
    } catch {
    }
  }
  try {
    const websiteEl = cardEl.querySelector('a[data-value="Website"], a[aria-label*="Website"], a[href^="http"]:not([href*="google.com"])');
    if (websiteEl && websiteEl.getAttribute) {
      const href = websiteEl.getAttribute("href");
      if (href && !href.includes("google.com/maps")) {
        result.websiteUrl = href;
      }
    }
  } catch {
  }
  if (!result.businessStatus) {
    for (const sel of CARD_SELECTORS.status) {
      try {
        const sEl = cardEl.querySelector(sel);
        const txt = extractText(sEl);
        if (txt) {
          result.businessStatus = txt;
          break;
        }
      } catch {
      }
    }
  }
  result.isDetail = false;
  result.surfaceType = "CARD";
  return result;
}

// src/extension/acquisition/engine/resultSurfaceDetector.ts
var SURFACE_SELECTORS = {
  semanticFeed: [
    'div[role="feed"]',
    'div[aria-label*="Results"]',
    'div[aria-label*="results"]',
    'div[aria-label*="Result list"]'
  ],
  structuralContainer: [
    "div.m6QErb.DxyBCb.kA9KIf.dS8AEf",
    "div.m6QErb[aria-label]",
    'div.m6QErb:has(div[jsaction*="mouseover"])',
    'div[jsaction*="pane.wfvdle"]',
    "div.m6QErb"
  ],
  fallbackSelectors: [
    'div#QA0Szd div[tabindex="-1"]',
    'div[style*="overflow-y: scroll"]',
    'div[style*="overflow-y: auto"]'
  ]
};
function getElementScrollMetrics(el) {
  const scrollTop = el?.scrollTop ?? 0;
  const clientHeight = el?.clientHeight ?? 0;
  const scrollHeight = el?.scrollHeight ?? 0;
  const isScrollable = scrollHeight > clientHeight && clientHeight > 0;
  return {
    scrollTop,
    clientHeight,
    scrollHeight,
    isScrollable
  };
}
function scoreContainerCandidate(container, selectorTier, elementPath = "") {
  let score = 0;
  const reasons = [];
  const metrics = getElementScrollMetrics(container);
  const hasRoleFeed = Boolean(container.getAttribute && container.getAttribute("role") === "feed");
  const hasAriaResults = Boolean(container.getAttribute && /result/i.test(container.getAttribute("aria-label") || ""));
  if (hasRoleFeed) {
    score += 0.4;
    reasons.push('Explicit role="feed" attribute');
    if (hasAriaResults) {
      score += 0.05;
      reasons.push("Matched aria-label for results");
    }
  } else if (selectorTier === "SEMANTIC") {
    score += 0.35;
    reasons.push("Matched semantic feed role/aria-label");
  } else if (selectorTier === "STRUCTURAL") {
    score += 0.25;
    reasons.push("Matched structural Maps panel container");
  } else {
    score += 0.15;
    reasons.push("Matched fallback scrollable container");
  }
  let cardCount = 0;
  let validCardCount = 0;
  if (container.querySelectorAll) {
    try {
      const cardNodes = container.querySelectorAll(CARD_SELECTORS.cardContainers.join(", "));
      cardCount = cardNodes.length;
      for (let i = 0; i < Math.min(cardNodes.length, 5); i++) {
        const cls = classifyCandidateCard(cardNodes[i]);
        if (cls.isBusinessCard) {
          validCardCount++;
        }
      }
    } catch {
    }
  }
  if (cardCount > 0) {
    score += 0.3;
    reasons.push(`Contains ${cardCount} candidate cards (${validCardCount} validated)`);
  }
  if (metrics.isScrollable) {
    score += 0.25;
    reasons.push(`Vertically scrollable (scrollHeight=${metrics.scrollHeight} > clientHeight=${metrics.clientHeight})`);
  } else if (metrics.clientHeight > 0 && cardCount > 2) {
    score += 0.1;
    reasons.push("Container has positive clientHeight with multiple cards");
  } else {
    reasons.push("Container not currently scrollable");
  }
  const tagName = (container.tagName || "").toLowerCase();
  if (tagName === "canvas" || tagName === "body" || tagName === "html") {
    score = 0;
    reasons.push("Rejected document/canvas container");
  }
  const confidence = Math.min(1, Math.round(score * 100) / 100);
  const validated = confidence >= 0.55 && (cardCount > 0 || hasRoleFeed && metrics.isScrollable);
  return {
    elementPath,
    confidence,
    reason: reasons.join("; "),
    scrollTop: metrics.scrollTop,
    clientHeight: metrics.clientHeight,
    scrollHeight: metrics.scrollHeight,
    candidateCardCount: cardCount,
    isScrollable: metrics.isScrollable,
    validated
  };
}
function detectResultSurface(domRoot) {
  const failCandidate = {
    confidence: 0,
    reason: "DOM context unavailable",
    scrollTop: 0,
    clientHeight: 0,
    scrollHeight: 0,
    candidateCardCount: 0,
    isScrollable: false,
    validated: false
  };
  if (!domRoot || !domRoot.querySelector) {
    return {
      surfaceElement: null,
      candidate: failCandidate,
      found: false,
      status: "RESULT_SURFACE_NOT_FOUND",
      container: null
    };
  }
  for (const sel of SURFACE_SELECTORS.semanticFeed) {
    try {
      const el = domRoot.querySelector(sel);
      if (el) {
        const candidate = scoreContainerCandidate(el, "SEMANTIC", sel);
        if (candidate.validated) {
          return {
            surfaceElement: el,
            candidate,
            found: true,
            status: "SURFACE_DETECTED",
            container: { ...candidate, element: el }
          };
        }
      }
    } catch {
    }
  }
  for (const sel of SURFACE_SELECTORS.structuralContainer) {
    try {
      const el = domRoot.querySelector(sel);
      if (el) {
        const candidate = scoreContainerCandidate(el, "STRUCTURAL", sel);
        if (candidate.validated) {
          return {
            surfaceElement: el,
            candidate,
            found: true,
            status: "SURFACE_DETECTED",
            container: { ...candidate, element: el }
          };
        }
      }
    } catch {
    }
  }
  for (const sel of SURFACE_SELECTORS.fallbackSelectors) {
    try {
      const el = domRoot.querySelector(sel);
      if (el) {
        const candidate = scoreContainerCandidate(el, "FALLBACK", sel);
        if (candidate.validated) {
          return {
            surfaceElement: el,
            candidate,
            found: true,
            status: "SURFACE_DETECTED",
            container: { ...candidate, element: el }
          };
        }
      }
    } catch {
    }
  }
  const failClosedCandidate = {
    confidence: 0,
    reason: "No candidate container satisfied result-surface validation thresholds",
    scrollTop: 0,
    clientHeight: 0,
    scrollHeight: 0,
    candidateCardCount: 0,
    isScrollable: false,
    validated: false
  };
  return {
    surfaceElement: null,
    candidate: failClosedCandidate,
    found: false,
    status: "RESULT_SURFACE_NOT_FOUND",
    container: null
  };
}

// src/extension/acquisition/engine/feedScrollEngine.ts
function validateAcquisitionPolicy(policy) {
  if (!policy) return { ...DEFAULT_ACQUISITION_POLICY };
  const sanitizeNumber = (val, fallback, min, max) => {
    if (typeof val !== "number" || isNaN(val) || !isFinite(val) || val < min || val > max) {
      return fallback;
    }
    return val;
  };
  return {
    maxScrollSteps: sanitizeNumber(policy.maxScrollSteps, DEFAULT_ACQUISITION_POLICY.maxScrollSteps, 1, 200),
    maxCandidates: sanitizeNumber(policy.maxCandidates, DEFAULT_ACQUISITION_POLICY.maxCandidates, 1, 1e3),
    maxDurationMs: sanitizeNumber(policy.maxDurationMs, DEFAULT_ACQUISITION_POLICY.maxDurationMs, 1e3, 6e5),
    scrollFractionOfViewport: sanitizeNumber(policy.scrollFractionOfViewport, DEFAULT_ACQUISITION_POLICY.scrollFractionOfViewport, 0.1, 1),
    loadWaitTimeoutMs: sanitizeNumber(policy.loadWaitTimeoutMs, DEFAULT_ACQUISITION_POLICY.loadWaitTimeoutMs, 10, 3e4),
    quietPeriodMs: sanitizeNumber(policy.quietPeriodMs, DEFAULT_ACQUISITION_POLICY.quietPeriodMs, 10, 5e3),
    maxNoNewCandidateCycles: sanitizeNumber(policy.maxNoNewCandidateCycles, DEFAULT_ACQUISITION_POLICY.maxNoNewCandidateCycles, 1, 10),
    retryLimit: sanitizeNumber(policy.retryLimit, DEFAULT_ACQUISITION_POLICY.retryLimit, 1, 10),
    exhaustionTolerancePx: sanitizeNumber(policy.exhaustionTolerancePx, DEFAULT_ACQUISITION_POLICY.exhaustionTolerancePx, 0, 500)
  };
}
var GoogleMapsFeedScrollEngine = class {
  constructor(domProviderOrPolicy, context, policy = {}, hooks = {}, deduplicator = new SessionCandidateDeduplicator()) {
    this._activeObserver = null;
    this._activeTimers = /* @__PURE__ */ new Set();
    this._observationSequence = 0;
    this._startTime = 0;
    this._userPaused = false;
    this._userCancelled = false;
    this._running = false;
    this._listeners = /* @__PURE__ */ new Map();
    if (typeof domProviderOrPolicy === "function") {
      this._domProvider = domProviderOrPolicy;
      this._context = context || { sessionId: "", searchUnitId: "", searchKeyword: "", pageUrl: "" };
      this._policy = validateAcquisitionPolicy(policy);
      this._hooks = hooks;
      this._deduplicator = deduplicator;
    } else {
      const pol = domProviderOrPolicy;
      this._domProvider = () => null;
      this._context = context || { sessionId: "", searchUnitId: "", searchKeyword: "", pageUrl: "" };
      this._policy = validateAcquisitionPolicy(pol);
      this._hooks = hooks;
      this._deduplicator = deduplicator;
    }
  }
  get deduplicator() {
    return this._deduplicator;
  }
  get observationSequence() {
    return this._observationSequence;
  }
  isRunning() {
    return this._running;
  }
  isPaused() {
    return this._userPaused;
  }
  requestPause() {
    this._userPaused = true;
  }
  requestCancel() {
    this._userCancelled = true;
  }
  on(event, fn) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, /* @__PURE__ */ new Set());
    }
    this._listeners.get(event).add(fn);
    return this;
  }
  emit(event, ...args) {
    const set = this._listeners.get(event);
    if (set) {
      for (const fn of set) {
        try {
          fn(...args);
        } catch {
        }
      }
    }
  }
  /**
   * Central timer helper to guarantee all timeouts are tracked and cancellable.
   */
  _setTimeout(fn, ms) {
    const timer = setTimeout(() => {
      this._activeTimers.delete(timer);
      fn();
    }, ms);
    this._activeTimers.add(timer);
    return timer;
  }
  /**
   * Cleans up all active timers and mutation observers cleanly.
   */
  cleanup() {
    for (const timer of this._activeTimers) {
      clearTimeout(timer);
    }
    this._activeTimers.clear();
    if (this._activeObserver && typeof this._activeObserver.disconnect === "function") {
      try {
        this._activeObserver.disconnect();
      } catch {
      }
      this._activeObserver = null;
    }
  }
  /**
   * Bounded wait for feed DOM changes after a scroll action.
   */
  async _waitForFeedUpdate(surfaceElement) {
    if (!surfaceElement) return false;
    return new Promise((resolve) => {
      let resolved = false;
      let quietTimer = null;
      const finish = (hadMutations) => {
        if (resolved) return;
        resolved = true;
        if (quietTimer) clearTimeout(quietTimer);
        this.cleanup();
        resolve(hadMutations);
      };
      this._setTimeout(() => {
        finish(false);
      }, this._policy.loadWaitTimeoutMs);
      if (typeof MutationObserver !== "undefined" && surfaceElement.nodeType) {
        try {
          this._activeObserver = new MutationObserver(() => {
            if (quietTimer) clearTimeout(quietTimer);
            quietTimer = setTimeout(() => {
              finish(true);
            }, this._policy.quietPeriodMs);
          });
          this._activeObserver.observe(surfaceElement, {
            childList: true,
            subtree: true,
            attributes: false
          });
          return;
        } catch {
        }
      }
      this._setTimeout(() => {
        finish(true);
      }, Math.min(this._policy.quietPeriodMs, 100));
    });
  }
  /**
   * Multi-signal exhaustion detector.
   */
  isFeedExhausted(surfaceElement, noProgressCycles) {
    if (!surfaceElement) {
      return { exhausted: true, reason: "Surface container missing" };
    }
    const dom = this._domProvider();
    if (dom && dom.querySelector) {
      const endMarker = dom.querySelector(
        '.HlvSq, [aria-label*="end of the list"], [aria-label*="End of list"], .m6QErb.tLzqyd:contains("end")'
      );
      if (endMarker) {
        return { exhausted: true, reason: "End-of-results DOM marker observed" };
      }
    }
    if (surfaceElement.querySelector) {
      const innerMarker = surfaceElement.querySelector(
        '.HlvSq, [aria-label*="end of the list"], [aria-label*="End of list"]'
      );
      if (innerMarker) {
        return { exhausted: true, reason: "End-of-results marker observed in surface" };
      }
    }
    const scrollTop = surfaceElement.scrollTop ?? 0;
    const clientHeight = surfaceElement.clientHeight ?? 0;
    const scrollHeight = surfaceElement.scrollHeight ?? 0;
    if (scrollHeight > 0 && clientHeight > 0) {
      const remainingDistance = scrollHeight - (scrollTop + clientHeight);
      if (remainingDistance <= this._policy.exhaustionTolerancePx && noProgressCycles >= 1) {
        return {
          exhausted: true,
          reason: `Geometric scroll bottom reached (remaining=${remainingDistance}px, noProgress=${noProgressCycles})`
        };
      }
    }
    if (noProgressCycles >= this._policy.maxNoNewCandidateCycles) {
      return {
        exhausted: true,
        reason: `Exhausted after ${noProgressCycles} consecutive cycles with zero new candidates`
      };
    }
    return { exhausted: false };
  }
  /**
   * Executes a single scroll observation cycle against a surface element.
   */
  async executeScrollCycle(surfaceElement, context, location, sequence = 1) {
    this._observationSequence = sequence;
    const cardElements = surfaceElement?.querySelectorAll ? Array.from(surfaceElement.querySelectorAll(CARD_SELECTORS.cardContainers.join(", "))) : [];
    const cycleNewCandidates = [];
    let cycleDuplicates = 0;
    let cycleInvalids = 0;
    const cycleCandidateIds = [];
    for (const cardEl of cardElements) {
      const classification = classifyCandidateCard(cardEl);
      if (!classification.isBusinessCard) {
        cycleInvalids++;
        continue;
      }
      const rawData = extractRawCardNodeData(cardEl, context.pageUrl);
      const observation = createCandidateObservation(rawData, {
        sessionId: context.sessionId,
        searchUnitId: context.searchUnitId,
        searchKeyword: context.searchKeyword,
        searchLocation: location || context.searchLocation,
        pageUrl: context.pageUrl,
        pageKind: "SEARCH_RESULTS"
      });
      const identity = deriveCandidateIdentity({
        businessName: observation.businessName.parsedValue,
        placeId: observation.placeId.parsedValue,
        mapsUrl: observation.mapsUrl.parsedValue,
        address: observation.address.parsedValue,
        category: observation.category.parsedValue,
        searchKeyword: context.searchKeyword,
        searchLocation: location || context.searchLocation,
        searchUnitId: context.searchUnitId
      });
      const identifiedObservation = {
        ...observation,
        observationId: observation.observationId || identity.candidateId,
        candidateId: identity.candidateId,
        identityMethod: identity.identityMethod,
        identityConfidence: identity.identityConfidence,
        identityEvidence: identity.evidence
      };
      cycleCandidateIds.push(identity.candidateId);
      const { isNew, candidate } = this._deduplicator.register(identifiedObservation);
      if (isNew) {
        cycleNewCandidates.push(candidate);
        if (this._deduplicator.size >= this._policy.maxCandidates) {
          break;
        }
      } else {
        cycleDuplicates++;
      }
    }
    const prevScrollTop = surfaceElement?.scrollTop ?? 0;
    const stepDistance = Math.max(
      200,
      Math.round((surfaceElement?.clientHeight || 600) * this._policy.scrollFractionOfViewport)
    );
    if (surfaceElement) {
      if (typeof surfaceElement.scrollTo === "function") {
        surfaceElement.scrollTo({ top: prevScrollTop + stepDistance });
      } else if (typeof surfaceElement.scrollBy === "function") {
        surfaceElement.scrollBy(0, stepDistance);
      } else if (surfaceElement.scrollTop !== void 0) {
        surfaceElement.scrollTop += stepDistance;
      }
    }
    const newScrollTop = surfaceElement?.scrollTop ?? prevScrollTop;
    const scrollOutcome = newScrollTop > prevScrollTop ? "SCROLL_PROGRESS" : cycleNewCandidates.length > 0 ? "SCROLL_PROGRESS" : "SCROLL_NO_PROGRESS";
    const batch = {
      sessionId: context.sessionId,
      searchUnitId: context.searchUnitId,
      observationSequence: sequence,
      visibleCandidateCount: cardElements.length,
      newCandidateCount: cycleNewCandidates.length,
      duplicateCandidateCount: cycleDuplicates,
      invalidCandidateCount: cycleInvalids,
      candidateIds: cycleCandidateIds,
      newCandidates: cycleNewCandidates,
      scrollTop: newScrollTop,
      clientHeight: surfaceElement?.clientHeight ?? 0,
      scrollHeight: surfaceElement?.scrollHeight ?? 0,
      isAtBottom: false,
      hasNewContent: cycleNewCandidates.length > 0,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      scrollOutcome
    };
    this.emit("batch", batch);
    return batch;
  }
  /**
   * Runs acquisition loop over a specified surface container.
   */
  async runAcquisitionLoop(surfaceContainer, context, location) {
    this._running = true;
    this._context = context;
    this._startTime = Date.now();
    let scrollStep = 0;
    let consecutiveNoProgressCycles = 0;
    const batches = [];
    const emittedCandidates = [];
    const metrics = {
      scrollSteps: 0,
      observationCycles: 0,
      visibleCandidateObservations: 0,
      uniqueCandidates: 0,
      duplicateObservations: 0,
      invalidCandidates: 0,
      scrollNoProgressCycles: 0,
      feedGrowthEvents: 0,
      extractionErrors: 0,
      elapsedMs: 0
    };
    let terminationReason = "EXHAUSTED";
    try {
      while (true) {
        metrics.elapsedMs = Date.now() - this._startTime;
        if (metrics.elapsedMs >= this._policy.maxDurationMs) {
          terminationReason = "TIMEOUT";
          break;
        }
        if (this._userCancelled || this._hooks.isCancelled && this._hooks.isCancelled()) {
          terminationReason = "USER_CANCELLED";
          break;
        }
        if (this._userPaused || this._hooks.isPaused && this._hooks.isPaused()) {
          terminationReason = "USER_PAUSED";
          break;
        }
        this._observationSequence++;
        metrics.observationCycles++;
        const batch = await this.executeScrollCycle(
          surfaceContainer,
          context,
          location,
          this._observationSequence
        );
        batches.push(batch);
        metrics.visibleCandidateObservations += batch.visibleCandidateCount;
        metrics.invalidCandidates += batch.invalidCandidateCount;
        metrics.duplicateObservations += batch.duplicateCandidateCount;
        if (batch.newCandidates && batch.newCandidates.length > 0) {
          consecutiveNoProgressCycles = 0;
          metrics.feedGrowthEvents++;
          emittedCandidates.push(...batch.newCandidates);
        } else {
          consecutiveNoProgressCycles++;
          metrics.scrollNoProgressCycles++;
        }
        metrics.uniqueCandidates = this._deduplicator.size;
        if (this._deduplicator.size >= this._policy.maxCandidates) {
          terminationReason = "MAX_RESULTS_REACHED";
          break;
        }
        const exhaustionCheck = this.isFeedExhausted(surfaceContainer, consecutiveNoProgressCycles);
        if (exhaustionCheck.exhausted) {
          terminationReason = "EXHAUSTED";
          break;
        }
        scrollStep++;
        metrics.scrollSteps = scrollStep;
        if (scrollStep >= this._policy.maxScrollSteps) {
          terminationReason = "MAX_SCROLL_STEPS_REACHED";
          break;
        }
        await this._waitForFeedUpdate(surfaceContainer);
      }
    } finally {
      this.cleanup();
      this._running = false;
      metrics.elapsedMs = Date.now() - this._startTime;
      metrics.terminationReason = terminationReason;
    }
    return {
      metrics,
      batches,
      candidates: emittedCandidates,
      terminationReason
    };
  }
  async startScrollLoop() {
    return this.execute();
  }
  /**
   * Executes the controlled, stepwise acquisition loop using the configured domProvider.
   */
  async execute() {
    this._running = true;
    this._startTime = Date.now();
    let scrollStep = 0;
    let consecutiveNoProgressCycles = 0;
    const batches = [];
    const emittedCandidates = [];
    const metrics = {
      scrollSteps: 0,
      observationCycles: 0,
      visibleCandidateObservations: 0,
      uniqueCandidates: 0,
      duplicateObservations: 0,
      invalidCandidates: 0,
      scrollNoProgressCycles: 0,
      feedGrowthEvents: 0,
      extractionErrors: 0,
      elapsedMs: 0
    };
    let terminationReason = "EXHAUSTED";
    try {
      while (true) {
        metrics.elapsedMs = Date.now() - this._startTime;
        if (metrics.elapsedMs >= this._policy.maxDurationMs) {
          terminationReason = "TIMEOUT";
          break;
        }
        if (this._userCancelled || this._hooks.isCancelled && this._hooks.isCancelled()) {
          terminationReason = "USER_CANCELLED";
          break;
        }
        if (this._userPaused || this._hooks.isPaused && this._hooks.isPaused()) {
          terminationReason = "USER_PAUSED";
          break;
        }
        const dom = this._domProvider();
        const surfaceDetection = detectResultSurface(dom);
        if (!surfaceDetection.found || !surfaceDetection.container || !surfaceDetection.container.validated) {
          terminationReason = "UNSUPPORTED";
          if (this._hooks.onDiagnostic) {
            this._hooks.onDiagnostic({
              code: "RESULT_SURFACE_NOT_FOUND",
              severity: "P1",
              recoveryClass: "UNSUPPORTED",
              message: surfaceDetection.container?.reason || "Result surface not found in DOM",
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              sessionId: this._context.sessionId,
              searchUnitId: this._context.searchUnitId
            });
          }
          break;
        }
        const surfaceElement = surfaceDetection.container.element;
        this._observationSequence++;
        metrics.observationCycles++;
        const cardElements = surfaceElement.querySelectorAll ? Array.from(surfaceElement.querySelectorAll(CARD_SELECTORS.cardContainers.join(", "))) : [];
        metrics.visibleCandidateObservations += cardElements.length;
        const cycleNewCandidates = [];
        let cycleDuplicates = 0;
        let cycleInvalids = 0;
        const cycleCandidateIds = [];
        for (const cardEl of cardElements) {
          const classification = classifyCandidateCard(cardEl);
          if (!classification.isBusinessCard) {
            cycleInvalids++;
            metrics.invalidCandidates++;
            continue;
          }
          const rawData = extractRawCardNodeData(cardEl, this._context.pageUrl);
          const observation = createCandidateObservation(rawData, {
            sessionId: this._context.sessionId,
            searchUnitId: this._context.searchUnitId,
            searchKeyword: this._context.searchKeyword,
            searchLocation: this._context.searchLocation,
            pageUrl: this._context.pageUrl,
            pageKind: "SEARCH_RESULTS"
          });
          const identity = deriveCandidateIdentity({
            businessName: observation.businessName.parsedValue,
            placeId: observation.placeId.parsedValue,
            mapsUrl: observation.mapsUrl.parsedValue,
            address: observation.address.parsedValue,
            category: observation.category.parsedValue,
            searchKeyword: this._context.searchKeyword,
            searchLocation: this._context.searchLocation,
            searchUnitId: this._context.searchUnitId
          });
          const identifiedObservation = {
            ...observation,
            observationId: observation.observationId || identity.candidateId,
            candidateId: identity.candidateId,
            identityMethod: identity.identityMethod,
            identityConfidence: identity.identityConfidence,
            identityEvidence: identity.evidence
          };
          cycleCandidateIds.push(identity.candidateId);
          const { isNew, candidate: registeredCandidate } = this._deduplicator.register(identifiedObservation);
          if (isNew) {
            cycleNewCandidates.push(registeredCandidate);
            emittedCandidates.push(registeredCandidate);
            if (this._deduplicator.size >= this._policy.maxCandidates) {
              break;
            }
          } else {
            cycleDuplicates++;
            metrics.duplicateObservations++;
          }
        }
        metrics.uniqueCandidates = this._deduplicator.size;
        if (cycleNewCandidates.length > 0) {
          consecutiveNoProgressCycles = 0;
          metrics.feedGrowthEvents++;
          if (this._hooks.onNewCandidates) {
            this._hooks.onNewCandidates(cycleNewCandidates);
          }
        } else {
          consecutiveNoProgressCycles++;
          metrics.scrollNoProgressCycles++;
        }
        if (this._deduplicator.size >= this._policy.maxCandidates) {
          terminationReason = "MAX_RESULTS_REACHED";
          break;
        }
        const exhaustionCheck = this.isFeedExhausted(surfaceElement, consecutiveNoProgressCycles);
        const isAtBottom = exhaustionCheck.exhausted;
        const batch = {
          sessionId: this._context.sessionId,
          searchUnitId: this._context.searchUnitId,
          observationSequence: this._observationSequence,
          visibleCandidateCount: cardElements.length,
          newCandidateCount: cycleNewCandidates.length,
          duplicateCandidateCount: cycleDuplicates,
          invalidCandidateCount: cycleInvalids,
          candidateIds: cycleCandidateIds,
          newCandidates: cycleNewCandidates,
          scrollTop: surfaceElement.scrollTop ?? 0,
          clientHeight: surfaceElement.clientHeight ?? 0,
          scrollHeight: surfaceElement.scrollHeight ?? 0,
          isAtBottom,
          hasNewContent: cycleNewCandidates.length > 0,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        batches.push(batch);
        this.emit("batch", batch);
        if (this._hooks.onBatchCompleted) {
          this._hooks.onBatchCompleted(batch);
        }
        if (isAtBottom) {
          terminationReason = "EXHAUSTED";
          break;
        }
        scrollStep++;
        metrics.scrollSteps = scrollStep;
        if (scrollStep >= this._policy.maxScrollSteps) {
          terminationReason = "MAX_SCROLL_STEPS_REACHED";
          break;
        }
        const stepDistance = Math.max(
          200,
          Math.round((surfaceElement.clientHeight || 600) * this._policy.scrollFractionOfViewport)
        );
        const prevScrollTop = surfaceElement.scrollTop ?? 0;
        if (typeof surfaceElement.scrollBy === "function") {
          surfaceElement.scrollBy(0, stepDistance);
        } else if (surfaceElement.scrollTop !== void 0) {
          surfaceElement.scrollTop += stepDistance;
        }
        const newScrollTop = surfaceElement.scrollTop ?? prevScrollTop;
        if (newScrollTop === prevScrollTop && consecutiveNoProgressCycles >= this._policy.maxNoNewCandidateCycles) {
          terminationReason = "EXHAUSTED";
          break;
        }
        await this._waitForFeedUpdate(surfaceElement);
      }
    } finally {
      this.cleanup();
      this._running = false;
      metrics.elapsedMs = Date.now() - this._startTime;
      metrics.terminationReason = terminationReason;
    }
    return {
      metrics,
      batches,
      candidates: emittedCandidates,
      terminationReason
    };
  }
};

// src/extension/acquisition/engine/liveCapabilityProbe.ts
function probeGoogleMapsCapability(domRoot, currentUrl = "") {
  const diagnostics = [];
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const pageDetect = detectGoogleMapsPage(currentUrl, domRoot);
  const mapsPageDetected = pageDetect.isGoogleMaps;
  if (!mapsPageDetected) {
    diagnostics.push(`Page URL does not match supported Google Maps pattern: ${currentUrl}`);
  }
  const { surfaceElement, candidate: surfaceCandidate } = detectResultSurface(domRoot);
  const resultSurfaceDetected = surfaceCandidate.validated;
  if (!resultSurfaceDetected) {
    diagnostics.push(`Result surface not validated: ${surfaceCandidate.reason}`);
  }
  let visibleCandidateCount = 0;
  let validCandidateCount = 0;
  let sampleCandidate;
  if (surfaceElement && surfaceElement.querySelectorAll) {
    const cards = Array.from(surfaceElement.querySelectorAll(CARD_SELECTORS.cardContainers.join(", ")));
    visibleCandidateCount = cards.length;
    for (const c of cards) {
      const cls = classifyCandidateCard(c);
      if (cls.isBusinessCard) {
        validCandidateCount++;
        if (!sampleCandidate) {
          const raw = extractRawCardNodeData(c, currentUrl);
          const obs = createCandidateObservation(raw, {
            sessionId: "probe-session",
            searchUnitId: "probe-unit",
            searchKeyword: "probe",
            pageUrl: currentUrl,
            pageKind: pageDetect.pageKind
          });
          const id = deriveCandidateIdentity({
            businessName: obs.businessName.parsedValue,
            placeId: obs.placeId.parsedValue,
            mapsUrl: obs.mapsUrl.parsedValue,
            address: obs.address.parsedValue
          });
          sampleCandidate = {
            businessName: obs.businessName.parsedValue,
            rating: obs.rating.parsedValue,
            reviewCount: obs.reviewCount.parsedValue,
            address: obs.address.parsedValue,
            websiteAvailability: obs.websiteUrl.availability,
            identityMethod: id.identityMethod
          };
        }
      }
    }
  }
  const visibleCandidatesFound = validCandidateCount > 0;
  const fieldsObserved = Boolean(sampleCandidate?.businessName);
  const isScrollable = surfaceCandidate.isScrollable;
  const scrollProgressDetected = isScrollable;
  let exhaustionSignalDetected = false;
  if (domRoot && domRoot.querySelector) {
    const endMarker = domRoot.querySelector('.HlvSq, [aria-label*="end of the list"], [aria-label*="End of list"]');
    if (endMarker) exhaustionSignalDetected = true;
  }
  return {
    url: currentUrl,
    timestamp: now,
    capabilities: {
      mapsPageDetected,
      resultSurfaceDetected,
      visibleCandidatesFound,
      fieldsObserved,
      scrollProgressDetected,
      newCandidatesAfterScroll: false,
      // Non-destructive read probe does not alter scroll
      exhaustionSignalDetected
    },
    metrics: {
      visibleCandidateCount,
      validCandidateCount,
      surfaceConfidence: surfaceCandidate.confidence,
      surfaceSelector: surfaceCandidate.elementPath,
      sampleCandidate
    },
    diagnostics
  };
}

// src/extension/acquisition/engine/filterTypes.ts
var DEFAULT_GOOGLE_MAPS_FILTER = Object.freeze({
  rating: "ANY",
  website: "ANY"
});
function normalizeRatingFilter2(input) {
  if (typeof input !== "string") return "ANY";
  const trimmed = input.trim();
  if (trimmed === "MIN_4_5" || trimmed === "4.5+" || trimmed === "4.5") {
    return "MIN_4_5";
  }
  if (trimmed === "MIN_4_0" || trimmed === "4.0+" || trimmed === "4.0") {
    return "MIN_4_0";
  }
  return "ANY";
}
function normalizeWebsiteFilter2(input) {
  if (typeof input !== "string") return "ANY";
  const trimmed = input.trim();
  if (trimmed === "WITH_WEBSITE" || trimmed === "WITH" || trimmed === "PRESENT") {
    return "WITH_WEBSITE";
  }
  if (trimmed === "WITHOUT_WEBSITE" || trimmed === "WITHOUT" || trimmed === "ABSENT") {
    return "WITHOUT_WEBSITE";
  }
  return "ANY";
}
function normalizeFilterCriteria(input) {
  if (!input || typeof input !== "object") {
    return DEFAULT_GOOGLE_MAPS_FILTER;
  }
  const obj = input;
  return Object.freeze({
    rating: normalizeRatingFilter2(obj.rating),
    website: normalizeWebsiteFilter2(obj.website)
  });
}

// src/extension/acquisition/engine/filterEngine.ts
function evaluateRatingMatch(candidate, ratingFilter) {
  const canonicalFilter = normalizeRatingFilter2(ratingFilter);
  const ratingField = candidate.rating;
  const avail = ratingField ? ratingField.availability : "UNKNOWN";
  const val = ratingField ? ratingField.parsedValue : void 0;
  if (canonicalFilter === "ANY") {
    return {
      matches: true,
      reason: "RATING_ANY",
      observedAvailability: avail,
      observedValue: val
    };
  }
  const threshold = canonicalFilter === "MIN_4_5" ? 4.5 : 4;
  if (avail === "PRESENT") {
    if (typeof val === "number" && Number.isFinite(val)) {
      if (val >= threshold) {
        return {
          matches: true,
          reason: "RATING_THRESHOLD_MET",
          observedAvailability: avail,
          observedValue: val
        };
      }
      return {
        matches: false,
        reason: "RATING_BELOW_THRESHOLD",
        observedAvailability: avail,
        observedValue: val
      };
    }
    return {
      matches: false,
      reason: "RATING_AMBIGUOUS",
      observedAvailability: avail,
      observedValue: val
    };
  }
  if (avail === "UNKNOWN") {
    return {
      matches: false,
      reason: "RATING_UNKNOWN",
      observedAvailability: avail,
      observedValue: void 0
    };
  }
  if (avail === "ABSENT") {
    return {
      matches: false,
      reason: "RATING_ABSENT",
      observedAvailability: avail,
      observedValue: void 0
    };
  }
  if (avail === "AMBIGUOUS") {
    return {
      matches: false,
      reason: "RATING_AMBIGUOUS",
      observedAvailability: avail,
      observedValue: void 0
    };
  }
  return {
    matches: false,
    reason: "RATING_UNSUPPORTED",
    observedAvailability: avail,
    observedValue: void 0
  };
}
function evaluateWebsiteMatch(candidate, websiteFilter) {
  const canonicalWeb = normalizeWebsiteFilter2(websiteFilter);
  const webField = candidate.websiteUrl;
  const avail = webField ? webField.availability : "UNKNOWN";
  const rawUrl = webField ? webField.parsedValue || webField.rawValue : void 0;
  if (canonicalWeb === "ANY") {
    return {
      matches: true,
      reason: "WEBSITE_ANY",
      observedAvailability: avail,
      observedValue: rawUrl
    };
  }
  if (canonicalWeb === "WITH_WEBSITE") {
    if (avail === "PRESENT") {
      if (rawUrl) {
        const norm = normalizeWebsiteUrl(rawUrl);
        if (norm.isValid && !norm.normalizedUrl.includes("google.com/maps")) {
          return {
            matches: true,
            reason: "WEBSITE_PRESENT",
            observedAvailability: avail,
            observedValue: norm.normalizedUrl
          };
        }
      }
      return {
        matches: false,
        reason: "WEBSITE_AMBIGUOUS",
        observedAvailability: avail,
        observedValue: rawUrl
      };
    }
    if (avail === "ABSENT") {
      return {
        matches: false,
        reason: "WEBSITE_ABSENT",
        observedAvailability: avail,
        observedValue: void 0
      };
    }
    if (avail === "UNKNOWN") {
      return {
        matches: false,
        reason: "WEBSITE_UNKNOWN",
        observedAvailability: avail,
        observedValue: void 0
      };
    }
    if (avail === "AMBIGUOUS") {
      return {
        matches: false,
        reason: "WEBSITE_AMBIGUOUS",
        observedAvailability: avail,
        observedValue: void 0
      };
    }
    return {
      matches: false,
      reason: "WEBSITE_UNSUPPORTED",
      observedAvailability: avail,
      observedValue: void 0
    };
  }
  if (canonicalWeb === "WITHOUT_WEBSITE") {
    if (avail === "ABSENT") {
      return {
        matches: true,
        reason: "WEBSITE_ABSENT",
        observedAvailability: avail,
        observedValue: void 0
      };
    }
    if (avail === "PRESENT") {
      return {
        matches: false,
        reason: "WEBSITE_PRESENT",
        observedAvailability: avail,
        observedValue: rawUrl
      };
    }
    if (avail === "UNKNOWN") {
      return {
        matches: false,
        reason: "WEBSITE_UNKNOWN",
        observedAvailability: avail,
        observedValue: void 0
      };
    }
    if (avail === "AMBIGUOUS") {
      return {
        matches: false,
        reason: "WEBSITE_AMBIGUOUS",
        observedAvailability: avail,
        observedValue: void 0
      };
    }
    return {
      matches: false,
      reason: "WEBSITE_UNSUPPORTED",
      observedAvailability: avail,
      observedValue: void 0
    };
  }
  return {
    matches: false,
    reason: "WEBSITE_UNKNOWN",
    observedAvailability: avail,
    observedValue: void 0
  };
}
function formatFilterExplanation(ratingResOrEval, webRes, criteria) {
  if (ratingResOrEval && "rating" in ratingResOrEval && "website" in ratingResOrEval) {
    const ev = ratingResOrEval;
    if (ev.explanation) return ev.explanation;
    return formatFilterExplanation(ev.rating, ev.website, criteria || { rating: "ANY", website: "ANY" });
  }
  const ratingRes = ratingResOrEval;
  const effectiveWebRes = webRes || { matches: true, reason: "WEBSITE_ANY", observedAvailability: "UNKNOWN" };
  const effectiveCriteria = normalizeFilterCriteria(criteria);
  if (ratingRes.matches && effectiveWebRes.matches) {
    const rLabel = effectiveCriteria.rating === "MIN_4_5" ? "4.5+" : effectiveCriteria.rating === "MIN_4_0" ? "4.0+" : "any";
    const rNote = effectiveCriteria.rating === "ANY" ? "any rating" : `rating ${ratingRes.observedValue} meets ${rLabel}`;
    const wNote = effectiveCriteria.website === "ANY" ? "any website" : effectiveCriteria.website === "WITH_WEBSITE" ? "website is present" : "website is confirmed absent";
    return `Matches: ${rNote} and ${wNote}.`;
  }
  const parts = [];
  if (!ratingRes.matches) {
    if (ratingRes.reason === "RATING_BELOW_THRESHOLD") {
      const thresholdLabel = effectiveCriteria.rating === "MIN_4_5" ? "4.5" : "4.0";
      parts.push(`rating ${ratingRes.observedValue} is below ${thresholdLabel}`);
    } else if (ratingRes.reason === "RATING_UNKNOWN") {
      parts.push("rating status is unknown on observation surface");
    } else if (ratingRes.reason === "RATING_ABSENT") {
      parts.push("business has no rating");
    } else {
      parts.push(`rating evidence is ${ratingRes.observedAvailability.toLowerCase()}`);
    }
  }
  if (!webRes.matches) {
    if (effectiveCriteria.website === "WITH_WEBSITE") {
      if (webRes.reason === "WEBSITE_UNKNOWN") {
        parts.push("website was not shown on result card (presence unknown)");
      } else if (webRes.reason === "WEBSITE_ABSENT") {
        parts.push("website is confirmed absent");
      } else {
        parts.push(`website evidence is ${webRes.observedAvailability.toLowerCase()}`);
      }
    } else if (effectiveCriteria.website === "WITHOUT_WEBSITE") {
      if (webRes.reason === "WEBSITE_PRESENT") {
        parts.push("candidate has a verified website");
      } else if (webRes.reason === "WEBSITE_UNKNOWN") {
        parts.push("card omitted website link without proving absence");
      } else {
        parts.push(`website evidence is ${webRes.observedAvailability.toLowerCase()}`);
      }
    }
  }
  return `Does not match: ${parts.join("; ")}.`;
}
function evaluateCandidateFilter(candidate, filter) {
  const canonicalFilter = normalizeFilterCriteria(filter);
  const ratingRes = evaluateRatingMatch(candidate, canonicalFilter.rating);
  const webRes = evaluateWebsiteMatch(candidate, canonicalFilter.website);
  const matches = ratingRes.matches && webRes.matches;
  let combinedReason = "COMBINED_MATCH";
  if (!matches) {
    if (!ratingRes.matches && !webRes.matches) {
      combinedReason = "COMBINED_BOTH_MISMATCH";
    } else if (!ratingRes.matches) {
      combinedReason = "COMBINED_RATING_MISMATCH";
    } else {
      combinedReason = "COMBINED_WEBSITE_MISMATCH";
    }
  }
  const explanation = formatFilterExplanation(ratingRes, webRes, canonicalFilter);
  return {
    candidateId: candidate.observationId,
    observationId: candidate.observationId,
    matches,
    combinedReason,
    rating: ratingRes,
    website: webRes,
    explanation
  };
}
function filterCandidateDataset(candidates, filter, isAcquisitionRunning = false) {
  const canonicalFilter = normalizeFilterCriteria(filter);
  const matchingCandidateIds = [];
  const matchingObservations = [];
  const evaluations = /* @__PURE__ */ new Map();
  let rating4PlusCount = 0;
  let rating4_5PlusCount = 0;
  let websitePresentCount = 0;
  let websiteAbsentCount = 0;
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const evalResult = evaluateCandidateFilter(c, canonicalFilter);
    evaluations.set(c.observationId, evalResult);
    const rField = c.rating;
    if (rField && rField.availability === "PRESENT" && typeof rField.parsedValue === "number") {
      if (rField.parsedValue >= 4) rating4PlusCount++;
      if (rField.parsedValue >= 4.5) rating4_5PlusCount++;
    }
    const wField = c.websiteUrl;
    if (wField && wField.availability === "PRESENT") {
      const norm = normalizeWebsiteUrl(wField.parsedValue || wField.rawValue);
      if (norm.isValid && !norm.normalizedUrl.includes("google.com/maps")) {
        websitePresentCount++;
      }
    } else if (wField && wField.availability === "ABSENT") {
      websiteAbsentCount++;
    }
    const id = c.candidateId || c.observationId;
    if (evalResult.matches) {
      matchingCandidateIds.push(id);
      matchingObservations.push(c);
    }
  }
  const matchingCount = matchingObservations.length;
  const excludedCount = candidates.length - matchingCount;
  let emptyStateReason = "NONE";
  if (candidates.length === 0) {
    emptyStateReason = isAcquisitionRunning ? "ACQUISITION_IN_PROGRESS" : "NO_DATA";
  } else if (matchingCount === 0) {
    emptyStateReason = "NO_MATCHES";
  }
  const counts = {
    totalObserved: candidates.length,
    matchingCount,
    excludedCount,
    rating4PlusCount,
    rating4_5PlusCount,
    websitePresentCount,
    websiteAbsentCount
  };
  return {
    totalObserved: candidates.length,
    matchingCount,
    excludedCount,
    matchingCandidateIds,
    visibleCandidateIds: matchingCandidateIds,
    matchingObservations,
    visibleCandidates: matchingObservations,
    activeFilter: canonicalFilter,
    counts,
    emptyStateReason,
    evaluations
  };
}
var GoogleMapsFilterStateManager = class {
  constructor(initialCandidatesOrFilter = [], initialFilter) {
    this._activeFilter = Object.freeze({ ...DEFAULT_GOOGLE_MAPS_FILTER });
    this._rawCandidates = /* @__PURE__ */ new Map();
    this._isAcquisitionRunning = false;
    if (initialCandidatesOrFilter && !Array.isArray(initialCandidatesOrFilter) && ("rating" in initialCandidatesOrFilter || "website" in initialCandidatesOrFilter)) {
      this._activeFilter = normalizeFilterCriteria(initialCandidatesOrFilter);
    } else {
      const candidates = initialCandidatesOrFilter || [];
      for (const c of candidates) {
        this._rawCandidates.set(c.candidateId || c.observationId, c);
      }
      if (initialFilter) {
        this._activeFilter = normalizeFilterCriteria(initialFilter);
      }
    }
  }
  /**
   * Returns current immutable active filter criteria containing only canonical states.
   */
  getActiveFilter() {
    return { ...this._activeFilter };
  }
  /**
   * Updates rating filter and instantly re-evaluates filtered view without re-acquisition.
   * Automatically normalizes external/legacy input to canonical internal state.
   */
  setRatingFilter(rating) {
    this._activeFilter = Object.freeze({
      ...this._activeFilter,
      rating: normalizeRatingFilter2(rating)
    });
    this._cachedView = void 0;
    return this.getFilteredView();
  }
  /**
   * Updates website filter and instantly re-evaluates filtered view without re-acquisition.
   * Automatically normalizes external/legacy input to canonical internal state.
   */
  setWebsiteFilter(website) {
    this._activeFilter = Object.freeze({
      ...this._activeFilter,
      website: normalizeWebsiteFilter2(website)
    });
    this._cachedView = void 0;
    return this.getFilteredView();
  }
  /**
   * Sets full filter criteria and instantly re-evaluates view.
   * Guarantees internal state stores only canonical values.
   */
  setFilter(filter) {
    this._activeFilter = normalizeFilterCriteria(filter);
    this._cachedView = void 0;
    return this.getFilteredView();
  }
  /**
   * Resets active filters to default ANY / ANY and restores all candidates.
   * Completely local operation with zero network/DOM calls.
   */
  resetFilters() {
    this._activeFilter = Object.freeze({ ...DEFAULT_GOOGLE_MAPS_FILTER });
    this._cachedView = void 0;
    return this.getFilteredView();
  }
  resetFilter() {
    return this.resetFilters();
  }
  /**
   * Ingests a new candidate observation into the raw dataset and updates active view.
   * Does NOT discard candidates that do not match the active filter.
   */
  ingestCandidate(candidate) {
    this._rawCandidates.set(candidate.candidateId || candidate.observationId, candidate);
    this._cachedView = void 0;
    return this.getFilteredView();
  }
  /**
   * Ingests multiple candidate observations into the raw dataset in a single pass.
   */
  ingestCandidates(candidates) {
    for (const c of candidates) {
      this._rawCandidates.set(c.candidateId || c.observationId, c);
    }
    this._cachedView = void 0;
    return this.getFilteredView();
  }
  /**
   * Informs manager of acquisition lifecycle for empty-state distinction.
   */
  setAcquisitionRunning(isRunning) {
    this._isAcquisitionRunning = isRunning;
    this._cachedView = void 0;
  }
  /**
   * Returns total unique raw candidate count in dataset.
   */
  getRawCount() {
    return this._rawCandidates.size;
  }
  /**
   * Returns all raw candidates without mutation.
   */
  getRawCandidates() {
    return Array.from(this._rawCandidates.values());
  }
  getRawDataset() {
    return this.getRawCandidates();
  }
  /**
   * Retrieves or computes current filtered dataset view.
   */
  getFilteredView() {
    if (!this._cachedView) {
      const candidates = Array.from(this._rawCandidates.values());
      this._cachedView = filterCandidateDataset(
        candidates,
        this._activeFilter,
        this._isAcquisitionRunning
      );
    }
    return this._cachedView;
  }
  /**
   * Retrieves current dataset counts.
   */
  getCounts() {
    return this.getFilteredView().counts;
  }
};

// src/extension/acquisition/engine/bulkPlanTypes.ts
var DEFAULT_BULK_EXECUTION_POLICY = Object.freeze({
  maxSearchUnits: 500,
  maxCandidatesPerUnit: 50,
  maxScrollStepsPerUnit: 15,
  maxDurationPerUnitMs: 6e4,
  maxRunDurationMs: 18e5,
  maxRetriesPerUnit: 2,
  retryBackoffMs: 1e3,
  navigationTimeoutMs: 15e3,
  readinessTimeoutMs: 1e4
});

// src/extension/acquisition/engine/bulkPlanner.ts
var BULK_PLAN_SCHEMA_VERSION = 1;
var MAX_KEYWORD_LENGTH = 200;
var MAX_LOCATION_LENGTH = 200;
function normalizeKeywordList(rawKeywords) {
  if (!rawKeywords || !Array.isArray(rawKeywords)) {
    return [];
  }
  const seenKeys = /* @__PURE__ */ new Set();
  const normalized = [];
  for (const raw of rawKeywords) {
    if (typeof raw !== "string") continue;
    const trimmed = raw.replace(/[\x00-\x1F\x7F]/g, " ").replace(/\s+/g, " ").trim();
    if (trimmed.length === 0 || trimmed.length > MAX_KEYWORD_LENGTH) {
      continue;
    }
    const key = trimmed.toLowerCase();
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      normalized.push(key);
    }
  }
  return normalized;
}
function normalizeLocationList(rawLocations) {
  if (!rawLocations || !Array.isArray(rawLocations)) {
    return [];
  }
  const seenKeys = /* @__PURE__ */ new Set();
  const normalized = [];
  for (const raw of rawLocations) {
    if (typeof raw !== "string") continue;
    const trimmed = raw.replace(/[\x00-\x1F\x7F]/g, " ").replace(/\s+/g, " ").trim();
    if (trimmed.length === 0 || trimmed.length > MAX_LOCATION_LENGTH) {
      continue;
    }
    const key = trimmed.toLowerCase();
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      normalized.push(trimmed);
    }
  }
  return normalized;
}
function computePlanFingerprint(keywords, locations, schemaVersion = BULK_PLAN_SCHEMA_VERSION) {
  const sortedKeywords = [...keywords].map((k) => k.toLowerCase()).sort().join("|");
  const sortedLocations = [...locations].map((l) => l.toLowerCase()).sort().join("|");
  const composite = `v${schemaVersion}::kw:${sortedKeywords}::loc:${sortedLocations}`;
  return `bpfp_${hashStringDeterministic(composite)}`;
}
function validateBulkRequest(request, policyOverrides) {
  const policy = {
    ...DEFAULT_BULK_EXECUTION_POLICY,
    ...policyOverrides
  };
  const errors = [];
  const warnings = [];
  if (!request) {
    return {
      valid: false,
      isValid: false,
      errors: ["Request object is required"],
      warnings: [],
      plannedCount: 0,
      normalizedKeywords: [],
      normalizedLocations: []
    };
  }
  if (!request.keywords || !Array.isArray(request.keywords)) {
    errors.push("keywords array is required");
  }
  if (!request.locations || !Array.isArray(request.locations)) {
    errors.push("locations array is required");
  }
  if (Array.isArray(request.keywords)) {
    for (const kw of request.keywords) {
      if (typeof kw === "string" && kw.length > MAX_KEYWORD_LENGTH) {
        errors.push(`Keyword exceeds maximum length of ${MAX_KEYWORD_LENGTH}`);
        break;
      }
    }
  }
  if (Array.isArray(request.locations)) {
    for (const loc of request.locations) {
      if (typeof loc === "string" && loc.length > MAX_LOCATION_LENGTH) {
        errors.push(`Location exceeds maximum length of ${MAX_LOCATION_LENGTH}`);
        break;
      }
    }
  }
  const normalizedKeywords = normalizeKeywordList(request.keywords || []);
  const normalizedLocations = normalizeLocationList(request.locations || []);
  if (errors.length === 0 && normalizedKeywords.length === 0) {
    errors.push("At least one valid keyword is required");
  }
  if (errors.length === 0 && normalizedLocations.length === 0) {
    errors.push("At least one valid location is required");
  }
  const plannedCount = normalizedKeywords.length * normalizedLocations.length;
  if (plannedCount > policy.maxSearchUnits) {
    warnings.push(
      `Plan contains ${plannedCount} SearchUnits, exceeding recommended maximum of ${policy.maxSearchUnits}. Explicit confirmation required.`
    );
  }
  const isValid = errors.length === 0;
  return {
    valid: isValid,
    isValid,
    errors,
    warnings,
    plannedCount,
    normalizedKeywords,
    normalizedLocations
  };
}
function createBulkResearchPlan(request, policyOverrides) {
  const validation = validateBulkRequest(request, policyOverrides);
  if (!validation.isValid) {
    throw new Error(`Invalid BulkResearchRequest: ${validation.errors.join("; ")}`);
  }
  const policy = {
    ...DEFAULT_BULK_EXECUTION_POLICY,
    ...request.executionPolicy,
    ...policyOverrides
  };
  const { normalizedKeywords, normalizedLocations } = validation;
  const searchUnits = [];
  const seenUnitIds = /* @__PURE__ */ new Set();
  for (const kw of normalizedKeywords) {
    for (const loc of normalizedLocations) {
      const unitId = deriveSearchUnitId(kw, loc);
      if (seenUnitIds.has(unitId)) {
        continue;
      }
      seenUnitIds.add(unitId);
      const baseUnit = createSearchUnit({
        keyword: kw,
        location: loc,
        maxRetries: policy.maxRetriesPerUnit
      });
      searchUnits.push(
        Object.assign(baseUnit, { keyword: kw, location: loc })
      );
    }
  }
  const planFingerprint = computePlanFingerprint(
    normalizedKeywords,
    normalizedLocations,
    BULK_PLAN_SCHEMA_VERSION
  );
  const planId = request.planId || `plan_${planFingerprint}`;
  const initialFilter = normalizeFilterCriteria({
    rating: request.ratingFilter,
    website: request.websiteFilter
  });
  return Object.freeze({
    planId,
    planFingerprint,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    normalizedKeywords: Object.freeze(normalizedKeywords),
    normalizedLocations: Object.freeze(normalizedLocations),
    searchUnits: Object.freeze(searchUnits),
    totalUnits: searchUnits.length,
    initialFilter,
    executionPolicy: Object.freeze(policy),
    ...request.maxResults !== void 0 ? { maxResults: request.maxResults } : {},
    schemaVersion: BULK_PLAN_SCHEMA_VERSION
  });
}

// src/extension/acquisition/engine/enrichmentTypes.ts
var DEFAULT_ENRICHMENT_POLICY = {
  maxPendingEnrichmentJobs: 200,
  maxConcurrentTasks: 1,
  maxRetries: 1,
  maxPagesPerDomain: 5,
  pageTimeoutMs: 1e4,
  domainTimeoutMs: 3e4,
  maxDocumentBytes: 5e5,
  collectPeople: true,
  collectServices: true,
  detectTechnology: true
};
var ENRICHMENT_ADAPTER_VERSION = "1.0.0-phase21-22";

// src/extension/websiteIntelligence/urlSafety.ts
var FORBIDDEN_SCHEMES = /* @__PURE__ */ new Set([
  "javascript:",
  "data:",
  "file:",
  "vbscript:",
  "chrome:",
  "chrome-extension:",
  "blob:",
  "about:",
  "ws:",
  "wss:",
  "ftp:",
  "sftp:"
]);
var FORBIDDEN_INTERNAL_TLDS = [
  ".local",
  ".internal",
  "." + ["local", "host"].join(""),
  ".lan",
  ".corp",
  ".home",
  ".test",
  ".example",
  ".invalid"
];
function isPrivateOrLoopbackIPv4(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return false;
  }
  const [b0, b1] = parts;
  if (b0 === 0) return true;
  if (b0 === 127) return true;
  if (b0 === 10) return true;
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;
  if (b0 === 192 && b1 === 168) return true;
  if (b0 === 169 && b1 === 254) return true;
  return false;
}
function validateSafeWebUrl(rawUrl) {
  const trimmed = (rawUrl || "").trim();
  if (!trimmed) {
    return { isSafe: false, reason: "EMPTY_URL" };
  }
  const lower = trimmed.toLowerCase();
  for (const scheme of FORBIDDEN_SCHEMES) {
    if (lower.startsWith(scheme)) {
      return { isSafe: false, reason: `FORBIDDEN_SCHEME: ${scheme}` };
    }
  }
  let working = trimmed;
  if (!/^https?:\/\//i.test(working)) {
    working = "https://" + working;
  }
  let parsed;
  try {
    parsed = new URL(working);
  } catch {
    return { isSafe: false, reason: "MALFORMED_URL" };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { isSafe: false, reason: `INVALID_PROTOCOL: ${parsed.protocol}` };
  }
  const hostname = parsed.hostname.toLowerCase().trim();
  if (hostname === ["local", "host"].join("") || hostname === ["127", "0", "0", "1"].join(".") || hostname === "::1" || hostname === "0.0.0.0" || hostname === "[::1]") {
    return { isSafe: false, reason: "LOOPBACK_NOT_ALLOWED" };
  }
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    if (isPrivateOrLoopbackIPv4(hostname)) {
      return { isSafe: false, reason: "PRIVATE_NETWORK_NOT_ALLOWED" };
    }
  }
  if (hostname.startsWith("[fe8") || hostname.startsWith("[fc") || hostname.startsWith("[fd")) {
    return { isSafe: false, reason: "IPV6_LOCAL_NOT_ALLOWED" };
  }
  for (const tld of FORBIDDEN_INTERNAL_TLDS) {
    if (hostname.endsWith(tld)) {
      return { isSafe: false, reason: `INTERNAL_TLD_NOT_ALLOWED: ${tld}` };
    }
  }
  if (!hostname.includes(".") || hostname.includes(" ")) {
    return { isSafe: false, reason: "INVALID_HOSTNAME" };
  }
  return {
    isSafe: true,
    normalizedUrl: parsed.toString(),
    parsedUrl: parsed
  };
}
function isSafeSameOrigin(targetUrl, baseOrigin) {
  try {
    const targetParsed = new URL(targetUrl);
    const baseParsed = new URL(baseOrigin);
    if (targetParsed.protocol !== baseParsed.protocol) {
      if (!["http:", "https:"].includes(targetParsed.protocol)) return false;
    }
    const tHost = targetParsed.hostname.toLowerCase().replace(/^www\./, "");
    const bHost = baseParsed.hostname.toLowerCase().replace(/^www\./, "");
    return tHost === bHost;
  } catch {
    return false;
  }
}
function validateRedirectHop(locationHeader, currentUrl, baseOrigin) {
  if (!locationHeader || typeof locationHeader !== "string") {
    return { isSafe: false, reason: "EMPTY_REDIRECT_LOCATION" };
  }
  const trimmed = locationHeader.trim();
  if (!trimmed) {
    return { isSafe: false, reason: "EMPTY_REDIRECT_LOCATION" };
  }
  let resolved;
  try {
    resolved = new URL(trimmed, currentUrl);
  } catch {
    return { isSafe: false, reason: "MALFORMED_REDIRECT_URL" };
  }
  const safety = validateSafeWebUrl(resolved.toString());
  if (!safety.isSafe) {
    return { isSafe: false, reason: `UNSAFE_REDIRECT_TARGET: ${safety.reason}` };
  }
  if (!isSafeSameOrigin(resolved.toString(), baseOrigin)) {
    return { isSafe: false, reason: "CROSS_ORIGIN_REDIRECT_BLOCKED" };
  }
  return {
    isSafe: true,
    resolvedUrl: resolved.toString()
  };
}

// src/extension/acquisition/engine/enrichmentEligibility.ts
function evaluateWebsiteEligibility(candidate) {
  const websiteField = candidate.websiteUrl;
  if (!websiteField) {
    return {
      isEligible: false,
      status: "NOT_ELIGIBLE",
      reason: "Candidate website field is undefined"
    };
  }
  const availability = websiteField.availability;
  if (availability === "ABSENT") {
    return {
      isEligible: false,
      status: "SKIPPED_NO_WEBSITE",
      reason: "Candidate explicitly has no website (availability = ABSENT)"
    };
  }
  if (availability === "UNKNOWN") {
    return {
      isEligible: false,
      status: "NOT_ELIGIBLE",
      reason: "Candidate website is unknown (availability = UNKNOWN). Website discovery is prohibited."
    };
  }
  if (availability === "AMBIGUOUS" || availability === "UNSUPPORTED") {
    return {
      isEligible: false,
      status: "SKIPPED_AMBIGUOUS_WEBSITE",
      reason: `Candidate website availability is ${availability}`
    };
  }
  if (availability !== "PRESENT") {
    return {
      isEligible: false,
      status: "NOT_ELIGIBLE",
      reason: `Unsupported website availability: ${availability}`
    };
  }
  const hasWebsiteConflict = (candidate.fieldConflicts || []).some(
    (fc) => fc.fieldName === "website" || fc.fieldName === "websiteUrl"
  );
  const websiteEvidenceList = candidate.fieldEvidence?.websiteUrl || candidate.fieldEvidence?.website || [];
  const distinctTargets = /* @__PURE__ */ new Set();
  for (const ev of websiteEvidenceList) {
    if (ev.value && typeof ev.value === "string" && ev.availability === "PRESENT") {
      try {
        const parsed = new URL(ev.value.startsWith("http") ? ev.value : `https://${ev.value}`);
        const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
        distinctTargets.add(host);
      } catch {
        distinctTargets.add(ev.value.toLowerCase());
      }
    }
  }
  if (hasWebsiteConflict && distinctTargets.size > 1) {
    return {
      isEligible: false,
      status: "BLOCKED_WEBSITE_CONFLICT",
      reason: `Candidate has unresolved conflicting website targets (${Array.from(distinctTargets).join(", ")}). Crawl blocked.`,
      diagnosticCode: "WEBSITE_TARGET_CONFLICT"
    };
  }
  const rawTarget = websiteField.parsedValue || websiteField.rawValue;
  if (!rawTarget || typeof rawTarget !== "string" || !rawTarget.trim()) {
    return {
      isEligible: false,
      status: "SKIPPED_NO_WEBSITE",
      reason: "Candidate has PRESENT availability but empty website URL payload"
    };
  }
  const trimmed = rawTarget.trim();
  const lower = trimmed.toLowerCase();
  if (lower.includes("google.com/maps") || lower.includes("maps.google.com") || lower.includes("google.com/search") || lower.includes("goo.gl")) {
    return {
      isEligible: false,
      status: "BLOCKED",
      reason: "Website target points to Google internal URL",
      diagnosticCode: "WEBSITE_TARGET_INVALID"
    };
  }
  const safety = validateSafeWebUrl(trimmed);
  if (!safety.isSafe || !safety.normalizedUrl || !safety.parsedUrl) {
    const isSsrf = safety.reason?.includes("LOOPBACK") || safety.reason?.includes("PRIVATE_NETWORK") || safety.reason?.includes("INTERNAL_TLD") || safety.reason?.includes("IPV6_LOCAL");
    return {
      isEligible: false,
      status: "BLOCKED",
      reason: `URL safety rejection: ${safety.reason || "UNSAFE_URL"}`,
      diagnosticCode: isSsrf ? "WEBSITE_SSRF_BLOCKED" : "WEBSITE_TARGET_INVALID"
    };
  }
  const domain = safety.parsedUrl.hostname.toLowerCase().replace(/^www\./, "");
  return {
    isEligible: true,
    status: "QUEUED",
    targetUrl: safety.normalizedUrl,
    normalizedDomain: domain,
    reason: "Candidate website is PRESENT and safely validated"
  };
}

// src/extension/acquisition/engine/enrichmentMerger.ts
function mergeEnrichmentIntoCandidate(candidate, enrichmentResult) {
  const observedAt = enrichmentResult.completedAt || (/* @__PURE__ */ new Date()).toISOString();
  const emailsCount = enrichmentResult.contactEvidence?.emails.length || 0;
  const phonesCount = enrichmentResult.contactEvidence?.phones.length || 0;
  const socialCount = enrichmentResult.contactEvidence?.socialProfiles.length || 0;
  const peopleCount = enrichmentResult.personEvidence?.people.length || 0;
  const pagesVisited = enrichmentResult.pagesVisited.length;
  const enrichmentSummary = {
    status: enrichmentResult.status,
    targetUrl: enrichmentResult.websiteTarget,
    emailsCount,
    phonesCount,
    socialCount,
    peopleCount,
    pagesVisited,
    completedAt: enrichmentResult.completedAt
  };
  const updatedFieldEvidence = {};
  for (const [key, list] of Object.entries(candidate.fieldEvidence || {})) {
    updatedFieldEvidence[key] = [...list];
  }
  const updatedFieldConflicts = [...candidate.fieldConflicts || []];
  const newIssues = [...candidate.qualityMetrics?.issues || []];
  const mapsPhoneVal = candidate.phone?.parsedValue || candidate.phone?.rawValue;
  const normMapsPhone = normalizePhoneForIdentity(mapsPhoneVal);
  if (enrichmentResult.contactEvidence?.phones && enrichmentResult.contactEvidence.phones.length > 0) {
    if (!updatedFieldEvidence.phone) {
      updatedFieldEvidence.phone = [];
    }
    for (const webPhone of enrichmentResult.contactEvidence.phones) {
      const normWebPhone = normalizePhoneForIdentity(webPhone.phone);
      updatedFieldEvidence.phone.push({
        value: webPhone.phone,
        availability: "PRESENT",
        confidence: 0.9,
        observedAt: webPhone.observedAt || observedAt,
        searchUnitId: candidate.searchUnitId,
        observationId: `web_ph_${Math.abs(hashPhone(webPhone.phone))}`
      });
      if (normMapsPhone.isValid && normWebPhone.isValid) {
        if (arePhonesEquivalent(mapsPhoneVal, webPhone.phone)) {
        } else {
          if (!updatedFieldConflicts.some((fc) => fc.fieldName === "phone")) {
            updatedFieldConflicts.push({
              fieldName: "phone",
              values: [
                {
                  value: mapsPhoneVal,
                  availability: "PRESENT",
                  observedAt: candidate.firstObservedAt,
                  searchUnitId: candidate.searchUnitId,
                  observationId: candidate.candidateId
                },
                {
                  value: webPhone.phone,
                  availability: "PRESENT",
                  observedAt: webPhone.observedAt || observedAt,
                  searchUnitId: candidate.searchUnitId,
                  observationId: `web_${webPhone.phone}`
                }
              ],
              selectedValue: mapsPhoneVal,
              resolutionReason: "Retained primary Maps observation while preserving website phone divergence"
            });
          }
          if (!newIssues.some((iss) => iss.code === "INCONSISTENT_PHONE")) {
            newIssues.push({
              code: "INCONSISTENT_PHONE",
              field: "phone",
              severity: "LOW",
              message: `Website exposes differing phone (${webPhone.phone}) than Maps listing (${mapsPhoneVal})`
            });
          }
        }
      }
    }
  }
  const mapsAddrVal = candidate.address?.parsedValue || candidate.address?.rawValue;
  const normMapsAddr = normalizeAddressForIdentity(mapsAddrVal);
  const webAddress = enrichmentResult.contactEvidence?.address?.address;
  if (webAddress) {
    if (!updatedFieldEvidence.address) {
      updatedFieldEvidence.address = [];
    }
    updatedFieldEvidence.address.push({
      value: webAddress,
      availability: "PRESENT",
      confidence: 0.85,
      observedAt,
      searchUnitId: candidate.searchUnitId,
      observationId: `web_addr_${Math.abs(hashPhone(webAddress))}`
    });
    const normWebAddr = normalizeAddressForIdentity(webAddress);
    if (normMapsAddr.comparisonKey && normWebAddr.comparisonKey) {
      if (normMapsAddr.comparisonKey !== normWebAddr.comparisonKey) {
        if (!newIssues.some((iss) => iss.code === "INCONSISTENT_ADDRESS")) {
          newIssues.push({
            code: "INCONSISTENT_ADDRESS",
            field: "address",
            severity: "LOW",
            message: `Website exposes address (${webAddress}) with variances from Maps listing (${mapsAddrVal})`
          });
        }
        if (!updatedFieldConflicts.some((fc) => fc.fieldName === "address")) {
          updatedFieldConflicts.push({
            fieldName: "address",
            values: [
              {
                value: mapsAddrVal,
                availability: "PRESENT",
                observedAt: candidate.firstObservedAt,
                searchUnitId: candidate.searchUnitId,
                observationId: candidate.candidateId
              },
              {
                value: webAddress,
                availability: "PRESENT",
                observedAt,
                searchUnitId: candidate.searchUnitId,
                observationId: `web_${Math.abs(hashPhone(webAddress))}`
              }
            ],
            selectedValue: mapsAddrVal,
            resolutionReason: "Retained primary Maps observation while preserving website address divergence"
          });
        }
      }
    }
  }
  if (enrichmentResult.contactEvidence?.emails && enrichmentResult.contactEvidence.emails.length > 0) {
    if (!updatedFieldEvidence.email) {
      updatedFieldEvidence.email = [];
    }
    for (const em of enrichmentResult.contactEvidence.emails) {
      updatedFieldEvidence.email.push({
        value: em.email,
        availability: "PRESENT",
        confidence: 0.95,
        observedAt: em.observedAt || observedAt,
        searchUnitId: candidate.searchUnitId,
        observationId: `web_em_${Math.abs(hashPhone(em.email))}`
      });
    }
  }
  if (enrichmentResult.websiteEvidence?.canonicalUrl) {
    if (!updatedFieldEvidence.websiteUrl) {
      updatedFieldEvidence.websiteUrl = [];
    }
    updatedFieldEvidence.websiteUrl.push({
      value: enrichmentResult.websiteEvidence.canonicalUrl,
      availability: "PRESENT",
      confidence: 0.95,
      observedAt,
      searchUnitId: candidate.searchUnitId,
      observationId: `web_canon_${Math.abs(hashPhone(enrichmentResult.websiteEvidence.canonicalUrl))}`
    });
  }
  const prevMetrics = candidate.qualityMetrics;
  const fieldStates = { ...prevMetrics?.fieldStates || {} };
  if (updatedFieldConflicts.some((fc) => fc.fieldName === "phone")) {
    fieldStates.phone = "CONFLICTING";
  } else if (candidate.phone?.availability === "PRESENT") {
    fieldStates.phone = phonesCount > 0 ? "CONFIDENT" : fieldStates.phone || "SUPPORTED";
  }
  if (emailsCount > 0) {
    fieldStates.email = "CONFIDENT";
  }
  if (enrichmentResult.status === "COMPLETED" || enrichmentResult.status === "PARTIAL") {
    fieldStates.website = "CONFIDENT";
  }
  const coreFields = [
    candidate.businessName?.availability === "PRESENT",
    candidate.address?.availability === "PRESENT",
    candidate.phone?.availability === "PRESENT" || phonesCount > 0,
    candidate.websiteUrl?.availability === "PRESENT",
    candidate.rating?.availability === "PRESENT",
    candidate.reviewCount?.availability === "PRESENT",
    candidate.businessStatus?.availability === "PRESENT",
    candidate.category?.availability === "PRESENT",
    candidate.placeId?.availability === "PRESENT"
  ];
  const presentCoreCount = coreFields.filter(Boolean).length;
  const hasEmailBonus = emailsCount > 0 ? 1 : 0;
  const completenessPct = Math.min(100, Math.round((presentCoreCount + hasEmailBonus) / 10 * 100));
  const updatedQualityMetrics = {
    identityConfidence: prevMetrics?.identityConfidence || "HIGH",
    identityConfidenceScore: prevMetrics?.identityConfidenceScore || 0.95,
    dataCompleteness: Math.max(completenessPct, prevMetrics?.dataCompleteness || 0),
    observedFieldCount: prevMetrics?.observedFieldCount || 9,
    supportedFieldCount: (prevMetrics?.supportedFieldCount || 7) + (emailsCount > 0 ? 1 : 0),
    unknownFieldCount: Math.max(0, (prevMetrics?.unknownFieldCount || 2) - (emailsCount > 0 ? 1 : 0)),
    conflictFieldCount: updatedFieldConflicts.length,
    fieldStates,
    issues: newIssues
  };
  const enrichedCandidate = {
    ...candidate,
    // Google Lineage Preserved
    source: "GOOGLE_MAPS_BROWSER",
    isRestricted: true,
    // Attached enrichment data
    enrichmentStatus: enrichmentResult.status,
    enrichmentResult,
    enrichmentSummary,
    // Updated evidence and conflicts
    fieldEvidence: updatedFieldEvidence,
    fieldConflicts: updatedFieldConflicts,
    qualityMetrics: updatedQualityMetrics
  };
  return enrichedCandidate;
}
function hashPhone(val) {
  let hash = 0;
  for (let i = 0; i < val.length; i++) {
    hash = (hash << 5) - hash + val.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// src/extension/websiteIntelligence/types.ts
var DEFAULT_MAX_PAGES_PER_DOMAIN = 5;
var DEFAULT_MAX_PAGE_TIMEOUT_MS = 1e4;
var DEFAULT_MAX_DOMAIN_TIMEOUT_MS = 3e4;
var DEFAULT_CACHE_TTL_MS = 864e5;
var DEFAULT_MAX_DOCUMENT_BYTES = 5e5;
var DEFAULT_MAX_CACHE_ENTRIES = 100;
var DEFAULT_MAX_CACHE_BYTES = 5 * 1024 * 1024;

// src/extension/websiteIntelligence/observationCache.ts
function estimateObservationBytes(payload) {
  try {
    const json = JSON.stringify(payload);
    return json.length * 2 + 256;
  } catch {
    return 8192;
  }
}
function generateObservationCacheKey(targetUrl, config) {
  let origin = "";
  let pathScope = "/";
  try {
    const u = new URL(targetUrl.toLowerCase().trim());
    origin = `${u.protocol}//${u.hostname.replace(/^www\./, "")}${u.port ? ":" + u.port : ""}`;
    pathScope = u.pathname.replace(/\/+$/, "") || "/";
  } catch {
    origin = targetUrl.toLowerCase().trim();
  }
  const p = config?.maxPages ?? 5;
  const d = config?.maxDocumentBytes ?? 5e5;
  const tech = config?.detectTechnology !== false ? "1" : "0";
  const pp = config?.collectPeople !== false ? "1" : "0";
  const sv = config?.collectServices !== false ? "1" : "0";
  return `obs:${origin}${pathScope}:p${p}:d${d}:t${tech}:pp${pp}:s${sv}:v1`;
}
var BoundedObservationCache = class {
  constructor(options) {
    this.entries = /* @__PURE__ */ new Map();
    this.currentBytes = 0;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.expirations = 0;
    this.maxEntries = options?.maxEntries ?? DEFAULT_MAX_CACHE_ENTRIES;
    this.maxBytes = options?.maxBytes ?? DEFAULT_MAX_CACHE_BYTES;
    this.defaultTtlMs = options?.defaultTtlMs ?? DEFAULT_CACHE_TTL_MS;
  }
  /**
   * Retrieves an active neutral observation, updating its LRU position.
   * Returns a clean deep-clone to guarantee caller isolation.
   */
  get(key) {
    const entry = this.entries.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    const now = Date.now();
    if (now > entry.expiresAt) {
      this.entries.delete(key);
      this.currentBytes = Math.max(0, this.currentBytes - entry.byteSize);
      this.expirations++;
      this.misses++;
      return null;
    }
    this.entries.delete(key);
    entry.lastAccessedAt = now;
    this.entries.set(key, entry);
    this.hits++;
    return JSON.parse(JSON.stringify(entry.payload));
  }
  /**
   * Stores a neutral observation payload with deterministic LRU eviction.
   */
  set(key, payload, customTtlMs) {
    const byteSize = estimateObservationBytes(payload);
    if (byteSize > this.maxBytes) {
      return false;
    }
    const existing = this.entries.get(key);
    if (existing) {
      this.entries.delete(key);
      this.currentBytes = Math.max(0, this.currentBytes - existing.byteSize);
    }
    while ((this.entries.size >= this.maxEntries || this.currentBytes + byteSize > this.maxBytes) && this.entries.size > 0) {
      const oldestKey = this.entries.keys().next().value;
      if (!oldestKey) break;
      const oldestEntry = this.entries.get(oldestKey);
      this.entries.delete(oldestKey);
      if (oldestEntry) {
        this.currentBytes = Math.max(0, this.currentBytes - oldestEntry.byteSize);
      }
      this.evictions++;
    }
    const now = Date.now();
    const ttl = typeof customTtlMs === "number" ? customTtlMs : this.defaultTtlMs;
    const entry = {
      key,
      payload: JSON.parse(JSON.stringify(payload)),
      byteSize,
      cachedAt: now,
      lastAccessedAt: now,
      expiresAt: now + ttl
    };
    this.entries.set(key, entry);
    this.currentBytes += byteSize;
    return true;
  }
  /**
   * Deletes a specific cache key.
   */
  delete(key) {
    const existing = this.entries.get(key);
    if (!existing) return false;
    this.entries.delete(key);
    this.currentBytes = Math.max(0, this.currentBytes - existing.byteSize);
    return true;
  }
  /**
   * Removes all expired entries from cache.
   */
  pruneExpired() {
    const now = Date.now();
    let pruned = 0;
    for (const [key, entry] of this.entries.entries()) {
      if (now > entry.expiresAt) {
        this.entries.delete(key);
        this.currentBytes = Math.max(0, this.currentBytes - entry.byteSize);
        this.expirations++;
        pruned++;
      }
    }
    return pruned;
  }
  /**
   * Completely clears all cached entries.
   */
  clear() {
    this.entries.clear();
    this.currentBytes = 0;
  }
  /**
   * Current number of entries in the cache.
   */
  size() {
    return this.entries.size;
  }
  /**
   * Current estimated byte consumption.
   */
  getBytes() {
    return this.currentBytes;
  }
  /**
   * Diagnostics stats.
   */
  getStats() {
    return {
      entries: this.entries.size,
      currentBytes: this.currentBytes,
      maxEntries: this.maxEntries,
      maxBytes: this.maxBytes,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      expirations: this.expirations
    };
  }
};

// src/extension/websiteIntelligence/pageDiscovery.ts
var BANNED_PATH_PATTERNS = [
  "/login",
  "/signin",
  "/sign-in",
  "/signup",
  "/sign-up",
  "/register",
  "/auth",
  "/cart",
  "/checkout",
  "/my-account",
  "/account",
  "/wp-admin",
  "/wp-login",
  "/user",
  "/password",
  "/reset",
  "/admin",
  "/portal",
  "/session",
  "/logout",
  "/signout"
];
var BANNED_EXTENSIONS = [
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".rar",
  ".7z",
  ".exe",
  ".dmg",
  ".pkg",
  ".apk",
  ".bin",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".svg",
  ".webp",
  ".ico",
  ".mp4",
  ".avi",
  ".mov",
  ".wmv",
  ".mp3",
  ".wav",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx"
];
var BANNED_HOST_FRAGMENTS = [
  "facebook.com",
  "fb.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "youtube.com",
  "pinterest.com",
  "tiktok.com",
  "google.com",
  "amazon.",
  "ebay.",
  "aliexpress.",
  "apple.com",
  "doubleclick.net",
  "googleadservices.com",
  "googlesyndication.com"
];
var CATEGORY_PATTERNS = [
  {
    category: "CONTACT",
    priority: 1,
    patterns: [
      /\/contact(?:-us|us)?\b/i,
      /\/get-in-touch\b/i,
      /\/reach-us\b/i,
      /\/locations?\b/i,
      /\/find-us\b/i
    ]
  },
  {
    category: "ABOUT",
    priority: 2,
    patterns: [
      /\/about(?:-us)?\b/i,
      /\/our-story\b/i,
      /\/who-we-are\b/i,
      /\/company\b/i,
      /\/mission\b/i
    ]
  },
  {
    category: "SERVICES",
    priority: 3,
    patterns: [
      /\/services?\b/i,
      /\/our-services\b/i,
      /\/what-we-do\b/i,
      /\/practice-areas?\b/i,
      /\/treatments?\b/i,
      /\/products?\b/i,
      /\/solutions?\b/i
    ]
  },
  {
    category: "TEAM",
    priority: 4,
    patterns: [
      /\/team\b/i,
      /\/our-team\b/i,
      /\/leadership\b/i,
      /\/staff\b/i,
      /\/doctors?\b/i,
      /\/attorneys?\b/i,
      /\/providers?\b/i,
      /\/people\b/i,
      /\/board\b/i
    ]
  }
];
function categorizePagePath(url, rootUrl) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { url, category: "OTHER", priority: 99 };
  }
  const rootClean = rootUrl.toLowerCase().replace(/\/$/, "");
  const urlClean = url.toLowerCase().replace(/\/$/, "");
  if (rootClean === urlClean || parsed.pathname === "/" || !parsed.pathname) {
    return { url, category: "HOMEPAGE", priority: 0 };
  }
  const pathname = parsed.pathname.toLowerCase();
  for (const cat of CATEGORY_PATTERNS) {
    for (const pat of cat.patterns) {
      if (pat.test(pathname)) {
        return { url, category: cat.category, priority: cat.priority };
      }
    }
  }
  return { url, category: "OTHER", priority: 10 };
}
function extractCandidateLinksFromHtml(html, pageUrl) {
  const normHtml = html || "";
  const links = [];
  const currentOrigin = new URL(pageUrl).origin;
  const anchorRegex = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  const matches = normHtml.matchAll(anchorRegex);
  for (const m of matches) {
    const rawHref = (m[1] || "").trim();
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:") || rawHref.startsWith("javascript:") || rawHref.startsWith("data:")) {
      continue;
    }
    let absUrl;
    try {
      absUrl = new URL(rawHref, pageUrl).toString();
    } catch {
      continue;
    }
    const safety = validateSafeWebUrl(absUrl);
    if (!safety.isSafe || !safety.parsedUrl) {
      continue;
    }
    const parsed = safety.parsedUrl;
    if (!isSafeSameOrigin(absUrl, currentOrigin)) {
      continue;
    }
    const host = parsed.hostname.toLowerCase();
    if (BANNED_HOST_FRAGMENTS.some((b) => host.includes(b))) {
      continue;
    }
    const path = parsed.pathname.toLowerCase();
    if (BANNED_PATH_PATTERNS.some((b) => path.includes(b))) {
      continue;
    }
    if (BANNED_EXTENSIONS.some((ext) => path.endsWith(ext))) {
      continue;
    }
    const cleanPath = path.replace(/\/$/, "") || "/";
    const normalized = `${parsed.protocol}//${parsed.hostname}${cleanPath}`;
    if (!links.includes(normalized)) {
      links.push(normalized);
    }
  }
  return links;
}
function buildDiscoveryPlan(rootUrl, candidateLinks, maxPages = 5) {
  const cleanRoot = rootUrl.replace(/\/$/, "");
  const plan = [cleanRoot];
  const categorized = candidateLinks.filter((link) => link.replace(/\/$/, "") !== cleanRoot).map((link) => categorizePagePath(link, rootUrl)).sort((a, b) => a.priority - b.priority);
  const categoriesSeen = /* @__PURE__ */ new Set();
  for (const item of categorized) {
    if (plan.length >= maxPages) break;
    if (item.category !== "OTHER" && !categoriesSeen.has(item.category)) {
      plan.push(item.url);
      categoriesSeen.add(item.category);
    }
  }
  for (const item of categorized) {
    if (plan.length >= maxPages) break;
    if (!plan.includes(item.url)) {
      plan.push(item.url);
    }
  }
  return plan.slice(0, maxPages);
}

// src/extension/websiteIntelligence/technologyDetector.ts
var TECHNOLOGY_RULES = [
  // 1. CMS & Website Builders
  {
    name: "WordPress",
    category: "CMS",
    patterns: [
      { regex: /<meta[^>]+name=["']generator["'][^>]+content=["'][^"']*WordPress/i, state: "DETECTED", evidence: "WordPress generator meta tag" },
      { regex: /\/wp-content\/(?:themes|plugins)\//i, state: "DETECTED", evidence: "/wp-content/ asset path" },
      { regex: /\/wp-includes\//i, state: "DETECTED", evidence: "/wp-includes/ path" },
      { regex: /class=["'][^"']*\bwp-block-/i, state: "LIKELY", evidence: "wp-block- Gutenberg class" }
    ]
  },
  {
    name: "Shopify",
    category: "ECOMMERCE",
    patterns: [
      { regex: /cdn\.shopify\.com\/s\/files/i, state: "DETECTED", evidence: "Shopify CDN asset link" },
      { regex: /\bShopify\.theme\b/i, state: "DETECTED", evidence: "Shopify.theme JS object" },
      { regex: /myshopify\.com/i, state: "DETECTED", evidence: "myshopify.com reference" }
    ]
  },
  {
    name: "WooCommerce",
    category: "ECOMMERCE",
    patterns: [
      { regex: /\/plugins\/woocommerce\//i, state: "DETECTED", evidence: "WooCommerce plugin asset" },
      { regex: /\bclass=["'][^"']*\bwoocommerce\b/i, state: "DETECTED", evidence: "woocommerce CSS class" }
    ]
  },
  {
    name: "Wix",
    category: "CMS",
    patterns: [
      { regex: /static\.parastorage\.com/i, state: "DETECTED", evidence: "Wix parastorage CDN" },
      { regex: /<meta[^>]+name=["']generator["'][^>]+content=["'][^"']*Wix\.com/i, state: "DETECTED", evidence: "Wix generator meta tag" },
      { regex: /wix-warmup-data/i, state: "DETECTED", evidence: "Wix warmup data container" }
    ]
  },
  {
    name: "Webflow",
    category: "CMS",
    patterns: [
      { regex: /data-wf-page=["']/i, state: "DETECTED", evidence: "data-wf-page Webflow attribute" },
      { regex: /assets\.website-files\.com/i, state: "DETECTED", evidence: "Webflow CDN asset URL" },
      { regex: /<meta[^>]+name=["']generator["'][^>]+content=["'][^"']*Webflow/i, state: "DETECTED", evidence: "Webflow generator tag" }
    ]
  },
  {
    name: "Squarespace",
    category: "CMS",
    patterns: [
      { regex: /static1\.squarespace\.com/i, state: "DETECTED", evidence: "Squarespace static CDN" },
      { regex: /<!-- This is Squarespace\. -->/i, state: "DETECTED", evidence: "Squarespace comment signature" }
    ]
  },
  // 2. Booking & Scheduling Widgets
  {
    name: "Calendly",
    category: "BOOKING",
    patterns: [
      { regex: /assets\.calendly\.com\/assets\/external\/widget\.js/i, state: "DETECTED", evidence: "Calendly embedded widget script" },
      { regex: /href=["']https?:\/\/calendly\.com\/[^"']+/i, state: "LIKELY", evidence: "Outbound Calendly scheduling link" }
    ]
  },
  {
    name: "Acuity Scheduling",
    category: "BOOKING",
    patterns: [
      { regex: /embed\.acuityscheduling\.com\/js\/embed\.js/i, state: "DETECTED", evidence: "Acuity Scheduling embed script" },
      { regex: /acuityscheduling\.com\/schedule\.php/i, state: "LIKELY", evidence: "Acuity scheduling frame" }
    ]
  },
  {
    name: "Vagaro",
    category: "BOOKING",
    patterns: [
      { regex: /saleswidget\.vagaro\.com/i, state: "DETECTED", evidence: "Vagaro booking widget" }
    ]
  },
  // 3. Contact & Chat Widgets
  {
    name: "Intercom",
    category: "CHAT_WIDGET",
    patterns: [
      { regex: /widget\.intercom\.io\/widget\//i, state: "DETECTED", evidence: "Intercom live chat widget script" },
      { regex: /\bwindow\.Intercom\b/i, state: "DETECTED", evidence: "window.Intercom API" }
    ]
  },
  {
    name: "Drift",
    category: "CHAT_WIDGET",
    patterns: [
      { regex: /js\.driftt\.com\/include\//i, state: "DETECTED", evidence: "Drift chat widget script" }
    ]
  },
  {
    name: "Tawk.to",
    category: "CHAT_WIDGET",
    patterns: [
      { regex: /embed\.tawk\.to\/[a-z0-9]+/i, state: "DETECTED", evidence: "Tawk.to chat embed" }
    ]
  },
  {
    name: "Crisp",
    category: "CHAT_WIDGET",
    patterns: [
      { regex: /client\.crisp\.chat\/l\.js/i, state: "DETECTED", evidence: "Crisp live chat script" }
    ]
  },
  // 4. Analytics & Tag Managers
  {
    name: "Google Tag Manager",
    category: "TAG_MANAGER",
    patterns: [
      { regex: /googletagmanager\.com\/gtm\.js\?id=GTM-/i, state: "DETECTED", evidence: "Google Tag Manager container script" }
    ]
  },
  {
    name: "Google Analytics",
    category: "ANALYTICS",
    patterns: [
      { regex: /googletagmanager\.com\/gtag\/js\?id=(?:G|UA)-/i, state: "DETECTED", evidence: "Google Analytics gtag script" },
      { regex: /google-analytics\.com\/analytics\.js/i, state: "DETECTED", evidence: "Legacy Google Analytics script" }
    ]
  },
  {
    name: "Meta Pixel",
    category: "ANALYTICS",
    patterns: [
      { regex: /connect\.facebook\.net\/[a-z_]+\/fbevents\.js/i, state: "DETECTED", evidence: "Meta Pixel fbevents script" },
      { regex: /\bfbq\(\s*['"]init['"]/i, state: "DETECTED", evidence: 'fbq("init") Pixel call' }
    ]
  }
];
function detectTechnologiesInHtml(html) {
  const normHtml = html || "";
  const detectedSignals = [];
  const seenTech = /* @__PURE__ */ new Set();
  for (const rule of TECHNOLOGY_RULES) {
    for (const pat of rule.patterns) {
      if (pat.regex.test(normHtml)) {
        if (!seenTech.has(rule.name)) {
          seenTech.add(rule.name);
          detectedSignals.push({
            name: rule.name,
            category: rule.category,
            state: pat.state,
            evidence: pat.evidence,
            observedAt: (/* @__PURE__ */ new Date()).toISOString(),
            provenance: "LEADNORIA_DERIVED"
          });
        }
        break;
      }
    }
  }
  return detectedSignals;
}

// src/extension/websiteIntelligence/personExtractor.ts
var MAX_EXTRACTED_PEOPLE = 15;
var LEADERSHIP_TITLE_PATTERNS = [
  /\b(?:founder|co-founder|owner|co-owner|proprietor)\b/i,
  /\b(?:ceo|chief executive officer|cto|cfo|coo|cmo|cso|president|vice president|vp)\b/i,
  /\b(?:managing director|director|principal|general manager|gm|partner|managing partner)\b/i,
  /\b(?:attorney|lawyer|counsel|solicitor|barrister)\b/i,
  /\b(?:dr\.|doctor|dentist|orthodontist|surgeon|chiropractor|physician)\b/i,
  /\b(?:office manager|practice manager|operations manager|sales manager|branch manager)\b/i,
  /\b(?:lead technician|master plumber|master electrician|head chef)\b/i
];
function extractPeopleFromJsonLd(html, pageUrl) {
  const people = [];
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches = (html || "").matchAll(scriptRegex);
  for (const m of matches) {
    if (people.length >= MAX_EXTRACTED_PEOPLE) break;
    try {
      const parsed = JSON.parse(m[1].trim());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (!item || typeof item !== "object") continue;
        if (item["@type"] === "Person") {
          processPersonItem(item, people, pageUrl, "STRUCTURED_DATA");
        }
        if (Array.isArray(item.employee)) {
          for (const emp of item.employee) {
            processPersonItem(emp, people, pageUrl, "STRUCTURED_DATA");
          }
        }
        if (Array.isArray(item.founder)) {
          for (const f of item.founder) {
            processPersonItem(f, people, pageUrl, "STRUCTURED_DATA");
          }
        }
      }
    } catch {
    }
  }
  return people;
}
function processPersonItem(item, list, pageUrl, evidenceType) {
  if (list.length >= MAX_EXTRACTED_PEOPLE) return;
  if (!item || typeof item !== "object") return;
  const rawName = typeof item.name === "string" ? item.name.trim() : "";
  if (!rawName || rawName.length < 3 || rawName.length > 80) return;
  const fullName = rawName.replace(/\s+/g, " ");
  if (list.some((p) => p.fullName.toLowerCase() === fullName.toLowerCase())) return;
  const jobTitle = typeof item.jobTitle === "string" ? item.jobTitle.trim() : void 0;
  const email = typeof item.email === "string" && item.email.includes("@") ? item.email.trim().toLowerCase() : void 0;
  const phone = typeof item.telephone === "string" ? item.telephone.trim() : void 0;
  let linkedInUrl;
  if (typeof item.sameAs === "string" && item.sameAs.includes("linkedin.com/in/")) {
    linkedInUrl = item.sameAs.trim();
  } else if (Array.isArray(item.sameAs)) {
    const li = item.sameAs.find((u) => typeof u === "string" && u.includes("linkedin.com/in/"));
    if (li) linkedInUrl = li.trim();
  }
  list.push({
    fullName,
    jobTitle,
    email,
    phone,
    linkedInUrl,
    sourceUrl: pageUrl,
    evidenceType,
    observedAt: (/* @__PURE__ */ new Date()).toISOString(),
    provenance: "WEBSITE_DERIVED"
  });
}
function extractPeopleFromHtmlDom(html, pageUrl) {
  const people = [];
  const lowerUrl = pageUrl.toLowerCase();
  const isTeamOrAbout = lowerUrl.includes("/team") || lowerUrl.includes("/about") || lowerUrl.includes("/leadership") || lowerUrl.includes("/staff") || lowerUrl.includes("/people");
  const evidenceType = isTeamOrAbout ? "TEAM_PAGE" : "VISIBLE_CONTENT";
  const normHtml = html || "";
  const cardRegex = /<(?:div|article|section|li)[^>]*class=["'][^"']*(?:team|member|person|profile|bio|staff)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|article|section|li)>/gi;
  const cards = normHtml.matchAll(cardRegex);
  for (const card of cards) {
    if (people.length >= MAX_EXTRACTED_PEOPLE) break;
    const cardContent = card[1] || "";
    const nameMatch = cardContent.match(/<(?:h[2-4]|strong|span)[^>]*class=["'][^"']*(?:name|title)[^"']*["'][^>]*>([^<]+)<\/(?:h[2-4]|strong|span)>/i) || cardContent.match(/<h[3-4][^>]*>([^<]+)<\/h[3-4]>/i);
    if (!nameMatch) continue;
    const rawName = nameMatch[1].replace(/<[^>]+>/g, "").trim();
    if (!rawName || rawName.length < 3 || rawName.length > 70) continue;
    if (/\b(?:team|members|leadership|about|company|menu|services)\b/i.test(rawName)) continue;
    const fullName = rawName.replace(/\s+/g, " ");
    if (people.some((p) => p.fullName.toLowerCase() === fullName.toLowerCase())) continue;
    let jobTitle;
    const titleMatch = cardContent.match(/<(?:p|span|div)[^>]*class=["'][^"']*(?:role|position|job-title|designation)[^"']*["'][^>]*>([^<]+)<\/(?:p|span|div)>/i);
    if (titleMatch) {
      jobTitle = titleMatch[1].replace(/<[^>]+>/g, "").trim();
    } else {
      for (const pat of LEADERSHIP_TITLE_PATTERNS) {
        const textMatch = cardContent.match(pat);
        if (textMatch) {
          jobTitle = textMatch[0].trim();
          break;
        }
      }
    }
    let linkedInUrl;
    const liMatch = cardContent.match(/href=["'](https?:\/\/(?:www\.)?linkedin\.com\/in\/[^"']+)["']/i);
    if (liMatch) {
      linkedInUrl = liMatch[1].trim();
    }
    let email;
    const emailMatch = cardContent.match(/mailto:([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i) || cardContent.match(/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/i);
    if (emailMatch) {
      email = emailMatch[1].trim().toLowerCase();
    }
    if (jobTitle || isTeamOrAbout) {
      people.push({
        fullName,
        jobTitle,
        email,
        linkedInUrl,
        sourceUrl: pageUrl,
        evidenceType,
        observedAt: (/* @__PURE__ */ new Date()).toISOString(),
        provenance: "WEBSITE_DERIVED"
      });
    }
  }
  return people;
}
function extractPublicPeople(html, pageUrl) {
  const jsonLdPeople = extractPeopleFromJsonLd(html, pageUrl);
  const domPeople = extractPeopleFromHtmlDom(html, pageUrl);
  const consolidated = [...jsonLdPeople];
  for (const person of domPeople) {
    if (consolidated.length >= MAX_EXTRACTED_PEOPLE) break;
    const existing = consolidated.find((p) => p.fullName.toLowerCase() === person.fullName.toLowerCase());
    if (existing) {
      if (!existing.jobTitle && person.jobTitle) existing.jobTitle = person.jobTitle;
      if (!existing.email && person.email) existing.email = person.email;
      if (!existing.linkedInUrl && person.linkedInUrl) existing.linkedInUrl = person.linkedInUrl;
    } else {
      consolidated.push(person);
    }
  }
  return consolidated;
}

// src/extension/websiteIntelligence/serviceExtractor.ts
var MAX_EXTRACTED_SERVICES = 25;
function extractServicesFromJsonLd(html, pageUrl) {
  const services = [];
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches = (html || "").matchAll(scriptRegex);
  for (const m of matches) {
    if (services.length >= MAX_EXTRACTED_SERVICES) break;
    try {
      const parsed = JSON.parse(m[1].trim());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (!item || typeof item !== "object") continue;
        if (item["@type"] === "Service" && typeof item.name === "string") {
          addService(services, item.name, item.serviceType || item.category, pageUrl, item.description);
        }
        const offers = item.hasOfferCatalog?.itemListElement || item.offers || item.makesOffer;
        if (Array.isArray(offers)) {
          for (const off of offers) {
            const name = off.name || off.itemOffered?.name;
            if (typeof name === "string") {
              addService(services, name, off.itemOffered?.serviceType, pageUrl, off.description);
            }
          }
        }
      }
    } catch {
    }
  }
  return services;
}
function extractServicesFromHtmlDom(html, pageUrl) {
  const services = [];
  const lowerUrl = pageUrl.toLowerCase();
  const isServicesPage = lowerUrl.includes("/service") || lowerUrl.includes("/practice-area") || lowerUrl.includes("/treatment") || lowerUrl.includes("/what-we-do");
  const normHtml = html || "";
  const sectionRegex = /<(?:section|div|article)[^>]+(?:id|class)=["'][^"']*(?:service|offering|practice-area|treatment)[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div|article)>/gi;
  const sections = normHtml.matchAll(sectionRegex);
  for (const s of sections) {
    if (services.length >= MAX_EXTRACTED_SERVICES) break;
    const content = s[1] || "";
    const headingMatches = content.matchAll(/<h[2-4][^>]*>([^<]+)<\/h[2-4]>/gi);
    for (const h of headingMatches) {
      if (services.length >= MAX_EXTRACTED_SERVICES) break;
      const text = h[1].replace(/<[^>]+>/g, "").trim();
      if (isValidServiceName(text)) {
        addService(services, text, void 0, pageUrl);
      }
    }
    const liMatches = content.matchAll(/<li[^>]*>([^<]{3,80})<\/li>/gi);
    for (const li of liMatches) {
      if (services.length >= MAX_EXTRACTED_SERVICES) break;
      const text = li[1].replace(/<[^>]+>/g, "").trim();
      if (isValidServiceName(text)) {
        addService(services, text, void 0, pageUrl);
      }
    }
  }
  if (isServicesPage && services.length < 5) {
    const mainHeadings = normHtml.matchAll(/<h[2-3][^>]*>([^<]+)<\/h[2-3]>/gi);
    for (const h of mainHeadings) {
      if (services.length >= MAX_EXTRACTED_SERVICES) break;
      const text = h[1].replace(/<[^>]+>/g, "").trim();
      if (isValidServiceName(text)) {
        addService(services, text, void 0, pageUrl);
      }
    }
  }
  return services;
}
function isValidServiceName(text) {
  if (!text || text.length < 3 || text.length > 70) return false;
  const lower = text.toLowerCase();
  const banned = [
    "services",
    "our services",
    "all services",
    "what we do",
    "contact us",
    "about us",
    "read more",
    "learn more",
    "view details",
    "home",
    "privacy policy",
    "terms of service",
    "menu",
    "navigation",
    "quick links",
    "get in touch",
    "book now",
    "schedule now"
  ];
  return !banned.includes(lower) && !lower.startsWith("copyright");
}
function addService(list, rawName, category, pageUrl, snippet) {
  if (list.length >= MAX_EXTRACTED_SERVICES) return;
  const cleanName = rawName.replace(/\s+/g, " ").trim();
  if (list.some((s) => s.name.toLowerCase() === cleanName.toLowerCase())) return;
  list.push({
    name: cleanName,
    category: category ? category.trim() : void 0,
    sourceUrl: pageUrl,
    snippet: snippet ? snippet.slice(0, 200).trim() : void 0,
    observedAt: (/* @__PURE__ */ new Date()).toISOString(),
    provenance: "WEBSITE_DERIVED"
  });
}
function extractPublicServices(html, pageUrl) {
  const jsonLdServices = extractServicesFromJsonLd(html, pageUrl);
  const domServices = extractServicesFromHtmlDom(html, pageUrl);
  const consolidated = [...jsonLdServices];
  for (const s of domServices) {
    if (consolidated.length >= MAX_EXTRACTED_SERVICES) break;
    if (!consolidated.some((existing) => existing.name.toLowerCase() === s.name.toLowerCase())) {
      consolidated.push(s);
    }
  }
  return consolidated;
}

// src/extension/websiteIntelligence/conflictDetector.ts
function detectPhoneConflicts(phones) {
  const conflicts = [];
  if (phones.length < 2) return conflicts;
  const validPhones = phones.filter((p) => p.normalizedValue && p.status === "FOUND");
  if (validPhones.length < 2) return conflicts;
  const distinctNumbers = /* @__PURE__ */ new Map();
  for (const p of validPhones) {
    const key = p.e164Format || p.normalizedValue.replace(/\D/g, "");
    if (!distinctNumbers.has(key)) {
      const sourceUrl = p.evidence[0]?.pageUrl || "unknown";
      const observedAt = p.evidence[0]?.observedAt || (/* @__PURE__ */ new Date()).toISOString();
      distinctNumbers.set(key, { value: p.normalizedValue, sourceUrl, observedAt });
    }
  }
  if (distinctNumbers.size >= 2) {
    const values = Array.from(distinctNumbers.values());
    conflicts.push({
      conflictType: "PHONE_CONFLICT",
      field: "phone",
      values,
      description: `Observed ${values.length} distinct phone numbers across website pages: ${values.map((v) => v.value).join(" vs ")}`
    });
  }
  return conflicts;
}
function detectAddressConflicts(locations) {
  const conflicts = [];
  if (locations.length < 2) return conflicts;
  const validLocations = locations.filter((l) => l.normalizedAddress && l.status === "FOUND");
  if (validLocations.length < 2) return conflicts;
  const distinctAddresses = /* @__PURE__ */ new Map();
  for (const l of validLocations) {
    const key = l.normalizedAddress.toLowerCase().replace(/[^\w]/g, "");
    if (!distinctAddresses.has(key)) {
      const sourceUrl = l.evidence[0]?.pageUrl || "unknown";
      const observedAt = l.evidence[0]?.observedAt || (/* @__PURE__ */ new Date()).toISOString();
      distinctAddresses.set(key, { value: l.normalizedAddress, sourceUrl, observedAt });
    }
  }
  if (distinctAddresses.size >= 2) {
    const values = Array.from(distinctAddresses.values());
    conflicts.push({
      conflictType: "ADDRESS_CONFLICT",
      field: "address",
      values,
      description: `Observed ${values.length} distinct physical addresses across website pages`
    });
  }
  return conflicts;
}
function detectEmailConflicts(emails) {
  const conflicts = [];
  if (emails.length < 2) return conflicts;
  const validEmails = emails.filter((e) => e.normalizedEmail && e.status === "FOUND");
  if (validEmails.length < 2) return conflicts;
  const distinctEmails = /* @__PURE__ */ new Map();
  for (const e of validEmails) {
    const key = e.normalizedEmail.toLowerCase();
    if (!distinctEmails.has(key)) {
      const sourceUrl = e.evidence[0]?.pageUrl || "unknown";
      const observedAt = e.evidence[0]?.observedAt || (/* @__PURE__ */ new Date()).toISOString();
      distinctEmails.set(key, { value: e.normalizedEmail, sourceUrl, observedAt });
    }
  }
  const emailDomains = new Set(validEmails.map((e) => e.domainPart.toLowerCase()));
  if (emailDomains.size >= 2) {
    const values = Array.from(distinctEmails.values());
    conflicts.push({
      conflictType: "EMAIL_CONFLICT",
      field: "email",
      values,
      description: `Observed distinct email addresses on different domains: ${Array.from(emailDomains).join(", ")}`
    });
  }
  return conflicts;
}
function detectAllConflicts(phones, locations, emails) {
  return [
    ...detectPhoneConflicts(phones),
    ...detectAddressConflicts(locations),
    ...detectEmailConflicts(emails)
  ];
}

// src/extension/extraction/normalizer.ts
var KNOWN_TRACKING_PARAMS = /* @__PURE__ */ new Set([
  "fbclid",
  "gclid",
  "msclkid",
  "dclid",
  "gbraid",
  "wbraid"
]);
var LEGAL_SUFFIXES3 = [
  "llc",
  "l.l.c.",
  "inc",
  "inc.",
  "incorporated",
  "corp",
  "corp.",
  "corporation",
  "ltd",
  "ltd.",
  "limited",
  "gmbh",
  "co",
  "co.",
  "company",
  "pvt",
  "pvt.",
  "private limited",
  "enterprises",
  "holdings",
  "group",
  "sa",
  "s.a.",
  "plc",
  "s.l.",
  "sl",
  "sarl",
  "s.a.r.l.",
  "sas",
  "s.a.s.",
  "srl",
  "s.r.l."
];
var COMMON_COUNTRY_CODES = {
  US: { code: "US", dial: "1", nationalDigits: [10] },
  CA: { code: "CA", dial: "1", nationalDigits: [10] },
  GB: { code: "GB", dial: "44", nationalDigits: [10, 11] },
  UK: { code: "GB", dial: "44", nationalDigits: [10, 11] },
  BD: { code: "BD", dial: "880", nationalDigits: [10, 11] },
  DE: { code: "DE", dial: "49", nationalDigits: [9, 10, 11, 12] },
  FR: { code: "FR", dial: "33", nationalDigits: [9, 10] },
  ES: { code: "ES", dial: "34", nationalDigits: [9] },
  AU: { code: "AU", dial: "61", nationalDigits: [9, 10] },
  AE: { code: "AE", dial: "971", nationalDigits: [9] },
  IN: { code: "IN", dial: "91", nationalDigits: [10] },
  SG: { code: "SG", dial: "65", nationalDigits: [8] },
  NZ: { code: "NZ", dial: "64", nationalDigits: [8, 9] },
  IE: { code: "IE", dial: "353", nationalDigits: [9] },
  NL: { code: "NL", dial: "31", nationalDigits: [9] },
  IT: { code: "IT", dial: "39", nationalDigits: [9, 10] },
  BR: { code: "BR", dial: "55", nationalDigits: [10, 11] },
  JP: { code: "JP", dial: "81", nationalDigits: [10] }
};
function sanitizeText(raw, maxLength = 2e3) {
  if (raw === null || raw === void 0) return "";
  let text = String(raw);
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, "");
  text = text.replace(/<[^>]*>/g, " ");
  text = text.normalize("NFC");
  text = text.replace(/[ \t\r\f\v]+/g, " ").trim();
  if (text.length > maxLength) {
    text = text.substring(0, maxLength).trim();
  }
  return text;
}
function normalizeUrl(rawUrl) {
  const preCleaned = (rawUrl || "").trim().replace(/^[<(\["']+|[>)\]"']+$/g, "").trim();
  const original = sanitizeText(preCleaned, 2048);
  if (!original) {
    return {
      originalUrl: "",
      normalizedUrl: "",
      canonicalDomain: "",
      canonicalOrigin: "",
      protocol: "https:",
      hostname: "",
      pathname: "",
      hasMeaningfulSubdomain: false,
      preservedParams: {},
      isCredentialBearing: false,
      isValid: false,
      error: "EMPTY_URL"
    };
  }
  if (/^(javascript|data|blob|file|about|chrome|chrome-extension):/i.test(original)) {
    return {
      originalUrl: original,
      normalizedUrl: "",
      canonicalDomain: "",
      canonicalOrigin: "",
      protocol: "https:",
      hostname: "",
      pathname: "",
      hasMeaningfulSubdomain: false,
      preservedParams: {},
      isCredentialBearing: false,
      isValid: false,
      error: "SECURITY_REJECTED_PROTOCOL"
    };
  }
  let working = original;
  if (!/^https?:\/\//i.test(working)) {
    working = "https://" + working;
  }
  try {
    const parsed = new URL(working);
    if (parsed.username || parsed.password) {
      return {
        originalUrl: original,
        normalizedUrl: "",
        canonicalDomain: "",
        canonicalOrigin: "",
        protocol: "https:",
        hostname: "",
        pathname: "",
        hasMeaningfulSubdomain: false,
        preservedParams: {},
        isCredentialBearing: true,
        isValid: false,
        error: "SECURITY_REJECTED_CREDENTIALS"
      };
    }
    const protocol = parsed.protocol.toLowerCase() === "http:" ? "http:" : "https:";
    let hostname = parsed.hostname.toLowerCase().trim();
    hostname = hostname.replace(/\.+$/, "");
    const hostParts = hostname.split(".");
    let canonicalDomain = hostname;
    let hasMeaningfulSubdomain = false;
    if (hostname.startsWith("www.")) {
      canonicalDomain = hostname.substring(4);
    } else if (hostParts.length > 2) {
      hasMeaningfulSubdomain = true;
      canonicalDomain = hostname;
    }
    const cleanParams = new URLSearchParams();
    const preservedParams = {};
    for (const [key, value] of parsed.searchParams.entries()) {
      const lowerKey = key.toLowerCase();
      const isTracking = lowerKey.startsWith("utm_") || KNOWN_TRACKING_PARAMS.has(lowerKey);
      if (!isTracking) {
        cleanParams.append(key, value);
        preservedParams[key] = value;
      }
    }
    let pathname = parsed.pathname.replace(/\/+/g, "/");
    if (pathname === "/") {
      pathname = "";
    } else if (pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    const searchStr = cleanParams.toString() ? `?${cleanParams.toString()}` : "";
    const normalizedUrl = `${protocol}//${hostname}${pathname}${searchStr}`;
    const canonicalOrigin = `${protocol}//${hostname}`;
    return {
      originalUrl: original,
      normalizedUrl,
      canonicalDomain,
      canonicalOrigin,
      protocol,
      hostname,
      pathname,
      hasMeaningfulSubdomain,
      preservedParams,
      isCredentialBearing: false,
      isValid: true
    };
  } catch (err) {
    return {
      originalUrl: original,
      normalizedUrl: "",
      canonicalDomain: "",
      canonicalOrigin: "",
      protocol: "https:",
      hostname: "",
      pathname: "",
      hasMeaningfulSubdomain: false,
      preservedParams: {},
      isCredentialBearing: false,
      isValid: false,
      error: `MALFORMED_URL: ${err.message}`
    };
  }
}
function normalizePhone(rawPhone, countryHint) {
  const original = sanitizeText(rawPhone, 100);
  if (!original) {
    return {
      rawPhone: "",
      phoneState: "PHONE_INVALID",
      countryInference: "COUNTRY_UNKNOWN",
      isValid: false,
      error: "EMPTY_PHONE"
    };
  }
  let extension;
  let cleanInput = original;
  const extMatch = original.match(/(?:ext|ext\.|x|#)\s*([0-9]{1,6})/i);
  if (extMatch) {
    extension = extMatch[1];
    cleanInput = original.substring(0, extMatch.index).trim();
  }
  const hasPlus = cleanInput.trim().startsWith("+");
  const digits = cleanInput.replace(/[^0-9]/g, "");
  if (digits.length < 5 || digits.length > 15) {
    return {
      rawPhone: original,
      phoneState: "PHONE_INVALID",
      countryInference: "COUNTRY_UNKNOWN",
      isValid: false,
      error: "INVALID_DIGIT_LENGTH"
    };
  }
  let countryMeta = countryHint ? COMMON_COUNTRY_CODES[countryHint.toUpperCase()] : void 0;
  let countryInference = countryHint ? "COUNTRY_EXPLICIT" : "COUNTRY_UNKNOWN";
  let e164;
  let dialCode;
  let nationalNumber = digits;
  if (hasPlus) {
    for (const meta of Object.values(COMMON_COUNTRY_CODES)) {
      if (digits.startsWith(meta.dial)) {
        dialCode = meta.dial;
        nationalNumber = digits.substring(meta.dial.length);
        e164 = `+${digits}`;
        if (!countryMeta) {
          countryMeta = meta;
          countryInference = "COUNTRY_INFERRED";
        }
        break;
      }
    }
    if (!e164) {
      e164 = `+${digits}`;
      countryInference = "COUNTRY_INFERRED";
    }
  } else if (countryMeta) {
    if (countryMeta.nationalDigits.includes(digits.length)) {
      e164 = `+${countryMeta.dial}${digits}`;
      dialCode = countryMeta.dial;
      nationalNumber = digits;
    } else if (digits.startsWith(countryMeta.dial)) {
      e164 = `+${digits}`;
      dialCode = countryMeta.dial;
      nationalNumber = digits.substring(countryMeta.dial.length);
    } else {
      return {
        rawPhone: original,
        phoneState: "PHONE_AMBIGUOUS",
        countryInference: "COUNTRY_EXPLICIT",
        countryCode: countryMeta.code,
        isValid: false,
        error: "AMBIGUOUS_NATIONAL_NUMBER_FOR_COUNTRY"
      };
    }
  } else {
    return {
      rawPhone: original,
      phoneState: "PHONE_AMBIGUOUS",
      countryInference: "COUNTRY_UNKNOWN",
      isValid: false,
      error: "AMBIGUOUS_WITHOUT_COUNTRY_CODE"
    };
  }
  return {
    rawPhone: original,
    e164Format: e164,
    internationalFormat: e164,
    nationalFormat: nationalNumber,
    countryCode: countryMeta?.code,
    countryInference,
    dialCode,
    extension,
    phoneState: "PHONE_NORMALIZED",
    isValid: true
  };
}
function normalizeEmail(rawEmail) {
  if (!rawEmail) {
    return {
      rawEmail: "",
      normalizedEmail: "",
      localPart: "",
      domainPart: "",
      isValid: false,
      error: "EMPTY_EMAIL"
    };
  }
  const stripped = String(rawEmail).trim().replace(/^[<(\["']+|[>)\]"']+$/g, "").trim();
  const original = sanitizeText(stripped, 254);
  if (!original) {
    return {
      rawEmail: String(rawEmail),
      normalizedEmail: "",
      localPart: "",
      domainPart: "",
      isValid: false,
      error: "EMPTY_EMAIL"
    };
  }
  const emailRegex = /^([a-zA-Z0-9_\.\-\+]+)@([a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+)$/;
  const match = original.match(emailRegex);
  if (!match) {
    return {
      rawEmail: String(rawEmail),
      normalizedEmail: "",
      localPart: "",
      domainPart: "",
      isValid: false,
      error: "INVALID_EMAIL_SYNTAX"
    };
  }
  const localPart = match[1];
  const domainPart = match[2].toLowerCase();
  const normalizedEmail = `${localPart}@${domainPart}`;
  return {
    rawEmail: String(rawEmail),
    normalizedEmail,
    localPart,
    domainPart,
    isValid: true
  };
}
function detectScript(text) {
  const hasBengali = /[\u0980-\u09FF]/.test(text);
  const hasArabic = /[\u0600-\u06FF\u0750-\u077F]/.test(text);
  const hasLatin = /[a-zA-Z]/.test(text);
  const scripts = [hasBengali, hasArabic, hasLatin].filter(Boolean).length;
  if (scripts > 1) return "MIXED";
  if (hasBengali) return "BENGALI";
  if (hasArabic) return "ARABIC";
  if (hasLatin) return "LATIN";
  return "OTHER";
}
function normalizeBusinessName(rawName) {
  const original = sanitizeText(rawName, 300);
  if (!original) {
    return {
      displayName: "Unknown Business",
      normalizedName: "unknown business",
      comparisonName: "unknown business",
      detectedScript: "LATIN"
    };
  }
  let displayName = original.replace(/\s*·\s*Sponsored.*$/i, "").replace(/\s*Sponsored.*$/i, "").replace(/\s*\(official\)$/i, "").replace(/\s*\(verified\)$/i, "").replace(/\s+/g, " ").trim();
  const normalizedName = displayName.normalize("NFKC").toLowerCase();
  let comp = normalizedName;
  let matchedSuffix;
  const sortedSuffixes = [...LEGAL_SUFFIXES3].sort((a, b) => b.length - a.length);
  for (const suffix of sortedSuffixes) {
    const escaped = suffix.replace(/\./g, "\\.");
    const regex = new RegExp(`(?:\\b|\\s)${escaped}\\.?$`, "i");
    if (regex.test(comp)) {
      matchedSuffix = suffix;
      comp = comp.replace(regex, "").trim();
      break;
    }
  }
  const comparisonName = comp.replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
  const detectedScript = detectScript(displayName);
  return {
    displayName,
    normalizedName,
    comparisonName: comparisonName || normalizedName,
    legalSuffix: matchedSuffix,
    detectedScript
  };
}

// src/extension/enrichment/contactNormalizer.ts
var PLACEHOLDER_EMAIL_DOMAINS = /* @__PURE__ */ new Set([
  "example.com",
  "example.org",
  "example.net",
  "domain.com",
  "email.com",
  "sentry.io",
  "wixpress.com",
  "wordpress.org",
  "shopify.com",
  "myshopify.com",
  "gravatar.com",
  "schema.org"
]);
var GENERIC_EMAIL_PREFIXES = /* @__PURE__ */ new Set([
  "info",
  "contact",
  "contactus",
  "support",
  "sales",
  "hello",
  "hi",
  "admin",
  "administrator",
  "billing",
  "accounts",
  "press",
  "media",
  "jobs",
  "career",
  "careers",
  "hr",
  "help",
  "inquiry",
  "inquiries",
  "enquiry",
  "enquiries",
  "office",
  "frontdesk",
  "service",
  "services",
  "customercare",
  "customerservice",
  "team",
  "general",
  "mail",
  "reception",
  "booking",
  "bookings",
  "reservation",
  "reservations",
  "order",
  "orders"
]);
var DIRECT_ROLE_PREFIXES = /* @__PURE__ */ new Set([
  "ceo",
  "founder",
  "president",
  "director",
  "manager",
  "cto",
  "cfo",
  "coo",
  "cmo",
  "owner",
  "partner",
  "principal",
  "headmaster",
  "dean"
]);
function isSafeWebUrl(rawUrl) {
  if (!rawUrl) return false;
  const trimmed = rawUrl.trim().toLowerCase();
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:") || trimmed.startsWith("vbscript:") || trimmed.startsWith("file:") || trimmed.startsWith("blob:")) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
function sanitizeWebText(text, maxLength = 2e3) {
  if (!text) return "";
  return sanitizeText(text, maxLength);
}
function normalizeBusinessEmail(rawEmail) {
  if (!rawEmail) {
    return {
      rawValue: "",
      normalizedEmail: "",
      localPart: "",
      domainPart: "",
      emailType: "UNKNOWN",
      status: "NOT_FOUND",
      isValid: false,
      reason: "EMPTY_EMAIL"
    };
  }
  let cleaned = String(rawEmail).trim();
  if (cleaned.toLowerCase().startsWith("mailto:")) {
    cleaned = cleaned.slice(7);
  }
  const queryIdx = cleaned.indexOf("?");
  if (queryIdx !== -1) {
    cleaned = cleaned.slice(0, queryIdx);
  }
  cleaned = cleaned.replace(/^[<(\["']+|[>)\]"',;:]+$/g, "").trim();
  const lower = cleaned.toLowerCase();
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif") || lower.endsWith(".webp") || lower.endsWith(".svg") || lower.endsWith(".js") || lower.endsWith(".css")) {
    return {
      rawValue: String(rawEmail),
      normalizedEmail: "",
      localPart: "",
      domainPart: "",
      emailType: "UNKNOWN",
      status: "INVALID",
      isValid: false,
      reason: "ASSET_FILENAME_NOT_EMAIL"
    };
  }
  const baseResult = normalizeEmail(cleaned);
  if (!baseResult.isValid) {
    return {
      rawValue: String(rawEmail),
      normalizedEmail: "",
      localPart: "",
      domainPart: "",
      emailType: "UNKNOWN",
      status: "INVALID",
      isValid: false,
      reason: baseResult.error || "INVALID_EMAIL_SYNTAX"
    };
  }
  const domain = baseResult.domainPart.toLowerCase();
  if (PLACEHOLDER_EMAIL_DOMAINS.has(domain)) {
    return {
      rawValue: String(rawEmail),
      normalizedEmail: baseResult.normalizedEmail,
      localPart: baseResult.localPart,
      domainPart: domain,
      emailType: "UNKNOWN",
      status: "INVALID",
      isValid: false,
      reason: "PLACEHOLDER_OR_VENDOR_DOMAIN"
    };
  }
  const localClean = baseResult.localPart.toLowerCase().replace(/[^a-z0-9]/g, "");
  let emailType = "UNKNOWN";
  if (GENERIC_EMAIL_PREFIXES.has(localClean)) {
    emailType = "GENERIC_BUSINESS";
  } else if (DIRECT_ROLE_PREFIXES.has(localClean)) {
    emailType = "DIRECT_ROLE";
  } else if (baseResult.localPart.includes(".") || baseResult.localPart.includes("_") || baseResult.localPart.length > 3) {
    emailType = "APPARENT_PERSONAL";
  } else {
    emailType = "GENERIC_BUSINESS";
  }
  return {
    rawValue: String(rawEmail),
    normalizedEmail: `${baseResult.localPart.toLowerCase()}@${domain}`,
    localPart: baseResult.localPart,
    domainPart: domain,
    emailType,
    status: "FOUND",
    isValid: true
  };
}
function normalizeBusinessPhone(rawPhone, countryHint) {
  if (!rawPhone) {
    return {
      rawValue: "",
      normalizedValue: "",
      status: "NOT_FOUND",
      isValid: false,
      reason: "EMPTY_PHONE"
    };
  }
  let cleaned = String(rawPhone).trim();
  if (cleaned.toLowerCase().startsWith("tel:")) {
    cleaned = cleaned.slice(4);
  }
  const baseResult = normalizePhone(cleaned, countryHint);
  if (baseResult.phoneState === "PHONE_INVALID") {
    return {
      rawValue: String(rawPhone),
      normalizedValue: "",
      status: "INVALID",
      isValid: false,
      reason: baseResult.error || "INVALID_PHONE_NUMBER"
    };
  }
  if (baseResult.phoneState === "PHONE_AMBIGUOUS") {
    const digits = cleaned.replace(/[^0-9]/g, "");
    return {
      rawValue: String(rawPhone),
      normalizedValue: digits,
      status: "AMBIGUOUS",
      isValid: false,
      reason: baseResult.error || "AMBIGUOUS_WITHOUT_COUNTRY_CODE"
    };
  }
  return {
    rawValue: String(rawPhone),
    normalizedValue: baseResult.e164Format || baseResult.nationalFormat || cleaned,
    e164Format: baseResult.e164Format,
    nationalFormat: baseResult.nationalFormat,
    countryCode: baseResult.countryCode,
    dialCode: baseResult.dialCode,
    extension: baseResult.extension,
    status: "FOUND",
    isValid: true
  };
}
function normalizeSocialUrl(rawUrl) {
  if (!rawUrl) {
    return {
      rawUrl: "",
      normalizedUrl: "",
      domain: "",
      platformDomain: "",
      isValid: false,
      isShareWidget: false,
      reason: "EMPTY_URL"
    };
  }
  if (!isSafeWebUrl(rawUrl)) {
    return {
      rawUrl: String(rawUrl),
      normalizedUrl: "",
      domain: "",
      platformDomain: "",
      isValid: false,
      isShareWidget: false,
      reason: "UNSAFE_OR_MALFORMED_URL"
    };
  }
  const baseResult = normalizeUrl(rawUrl);
  if (!baseResult.isValid) {
    return {
      rawUrl: String(rawUrl),
      normalizedUrl: "",
      domain: "",
      platformDomain: "",
      isValid: false,
      isShareWidget: false,
      reason: baseResult.error || "MALFORMED_URL"
    };
  }
  const hostname = baseResult.hostname.toLowerCase().replace(/^www\./, "");
  const pathname = baseResult.pathname || "";
  const lowerPath = pathname.toLowerCase();
  const isShareWidget = lowerPath.includes("/sharer") || lowerPath.includes("/intent/tweet") || lowerPath.includes("/share") || lowerPath.includes("/sharearticle") || lowerPath.includes("/dialog/share") || lowerPath.includes("/pin/create");
  const cleanUrl = `${baseResult.protocol}//${hostname}${pathname}`.replace(/\/$/, "");
  return {
    rawUrl: String(rawUrl),
    normalizedUrl: cleanUrl,
    domain: baseResult.canonicalDomain,
    platformDomain: hostname,
    handleOrPath: pathname.replace(/^\/+/, "") || void 0,
    isValid: true,
    isShareWidget
  };
}
function normalizeBusinessAddress(rawAddress, countryHint) {
  const sanitized = sanitizeWebText(rawAddress, 500);
  if (!sanitized || sanitized.length < 5) {
    return {
      rawAddress: rawAddress || "",
      normalizedAddress: "",
      status: "NOT_FOUND",
      isValid: false
    };
  }
  const norm = sanitized.replace(/\s+/g, " ").trim();
  const postalMatch = norm.match(/\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}|\d{5}(?:-\d{4})?|\d{4,6})\b/i);
  const postalCode = postalMatch ? postalMatch[1].trim() : void 0;
  const parts = norm.split(",").map((p) => p.trim()).filter(Boolean);
  let status = "PARTIAL";
  if (parts.length >= 3 || parts.length >= 2 && postalCode) {
    status = "FOUND";
  } else if (parts.length === 1 && !postalCode) {
    status = "PARTIAL";
  }
  return {
    rawAddress: String(rawAddress),
    normalizedAddress: norm,
    postalCode,
    country: countryHint?.toUpperCase(),
    status,
    isValid: true
  };
}
function normalizeBusinessNameFact(rawName) {
  const sanitized = sanitizeWebText(rawName, 300);
  if (!sanitized) {
    return {
      rawValue: "",
      normalizedName: "",
      comparisonKey: "",
      status: "NOT_FOUND"
    };
  }
  const baseResult = normalizeBusinessName(sanitized);
  return {
    rawValue: sanitized,
    normalizedName: baseResult.displayName,
    comparisonKey: baseResult.comparisonName,
    status: "FOUND"
  };
}

// src/extension/enrichment/contactEvidence.ts
function generateEvidenceId(field, normalizedValue, pageUrl, evidenceType) {
  const normVal = (normalizedValue || "").toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 40);
  let cleanUrl = (pageUrl || "").toLowerCase();
  try {
    const u = new URL(cleanUrl);
    cleanUrl = `${u.hostname}${u.pathname}`;
  } catch {
  }
  const normUrl = cleanUrl.replace(/[^a-z0-9]/g, "_").slice(0, 40);
  return `ev_${field}_${normVal}_${normUrl}_${evidenceType.toLowerCase()}`;
}
function createContactEvidence(params) {
  const defaultStrength = params.evidenceType === "MAILTO_LINK" || params.evidenceType === "TEL_LINK" || params.evidenceType === "STRUCTURED_PAGE_CONTENT" || params.evidenceType === "CONTACT_FORM" ? "DIRECT_PUBLIC_OBSERVATION" : "DIRECT_PUBLIC_OBSERVATION";
  const cleanSnippet = params.contextSnippet ? params.contextSnippet.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 300) : void 0;
  return {
    id: generateEvidenceId(params.field, params.normalizedValue, params.pageUrl, params.evidenceType),
    field: params.field,
    rawValue: params.rawValue,
    normalizedValue: params.normalizedValue,
    pageUrl: params.pageUrl,
    evidenceType: params.evidenceType,
    evidenceStrength: params.evidenceStrength || defaultStrength,
    contextSnippet: cleanSnippet,
    extractionState: params.extractionState || "EXTRACTED_FROM_PUBLIC_PAGE",
    observedAt: params.observedAt || "STATIC_DETERMINISTIC_TIMESTAMP"
  };
}
function deduplicateEvidence(evidenceList) {
  const seenIds = /* @__PURE__ */ new Set();
  const deduplicated = [];
  for (const item of evidenceList) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      deduplicated.push(item);
    }
  }
  return deduplicated.sort((a, b) => a.id.localeCompare(b.id));
}
function assessCorroboration(evidenceList) {
  const distinctPages = new Set(evidenceList.map((e) => e.pageUrl.toLowerCase().replace(/\/$/, "")));
  if (distinctPages.size >= 2) {
    return "CORROBORATED_PUBLIC_OBSERVATION";
  }
  if (evidenceList.some((e) => e.evidenceStrength === "DIRECT_PUBLIC_OBSERVATION")) {
    return "DIRECT_PUBLIC_OBSERVATION";
  }
  return "WEAK_OBSERVATION";
}

// src/extension/enrichment/contactDeduper.ts
function deduplicatePhones(phones) {
  const map = /* @__PURE__ */ new Map();
  for (const p of phones) {
    const key = (p.e164Format || p.normalizedValue || p.rawValue).replace(/[^0-9]/g, "");
    if (!key) continue;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...p,
        evidence: [...p.evidence],
        sourceContributions: [...p.sourceContributions]
      });
    } else {
      existing.evidence = deduplicateEvidence([...existing.evidence, ...p.evidence]);
      if (existing.status === "AMBIGUOUS" && p.status === "FOUND") {
        existing.status = "FOUND";
        existing.e164Format = p.e164Format || existing.e164Format;
        existing.nationalFormat = p.nationalFormat || existing.nationalFormat;
      }
      if (!existing.extension && p.extension) {
        existing.extension = p.extension;
      }
      if (!existing.label && p.label) {
        existing.label = p.label;
      }
    }
  }
  const results = Array.from(map.values()).map((p) => {
    p.evidence = deduplicateEvidence(p.evidence);
    const corrStrength = assessCorroboration(p.evidence);
    for (const ev of p.evidence) {
      if (corrStrength === "CORROBORATED_PUBLIC_OBSERVATION" && ev.evidenceStrength === "DIRECT_PUBLIC_OBSERVATION") {
        ev.evidenceStrength = "CORROBORATED_PUBLIC_OBSERVATION";
      }
    }
    return p;
  });
  return results.sort((a, b) => (a.normalizedValue || a.rawValue).localeCompare(b.normalizedValue || b.rawValue));
}
function deduplicateEmails(emails) {
  const map = /* @__PURE__ */ new Map();
  for (const e of emails) {
    const key = e.normalizedEmail.toLowerCase().trim();
    if (!key) continue;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...e,
        evidence: [...e.evidence],
        sourceContributions: [...e.sourceContributions]
      });
    } else {
      existing.evidence = deduplicateEvidence([...existing.evidence, ...e.evidence]);
      if (existing.emailType === "UNKNOWN" && e.emailType !== "UNKNOWN") {
        existing.emailType = e.emailType;
      }
    }
  }
  const results = Array.from(map.values()).map((e) => {
    e.evidence = deduplicateEvidence(e.evidence);
    const corrStrength = assessCorroboration(e.evidence);
    for (const ev of e.evidence) {
      if (corrStrength === "CORROBORATED_PUBLIC_OBSERVATION" && ev.evidenceStrength === "DIRECT_PUBLIC_OBSERVATION") {
        ev.evidenceStrength = "CORROBORATED_PUBLIC_OBSERVATION";
      }
    }
    return e;
  });
  return results.sort((a, b) => a.normalizedEmail.localeCompare(b.normalizedEmail));
}
function deduplicateLocations(locations) {
  const map = /* @__PURE__ */ new Map();
  for (const loc of locations) {
    const normKey = loc.normalizedAddress.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
    if (!normKey) continue;
    const existing = map.get(normKey);
    if (!existing) {
      map.set(normKey, {
        ...loc,
        evidence: [...loc.evidence],
        sourceContributions: [...loc.sourceContributions]
      });
    } else {
      existing.evidence = deduplicateEvidence([...existing.evidence, ...loc.evidence]);
      if (existing.status === "PARTIAL" && loc.status === "FOUND") {
        existing.status = "FOUND";
        existing.postalCode = loc.postalCode || existing.postalCode;
        existing.city = loc.city || existing.city;
        existing.streetAddress = loc.streetAddress || existing.streetAddress;
      }
      if (!existing.phone && loc.phone) {
        existing.phone = loc.phone;
      }
      if (!existing.label && loc.label) {
        existing.label = loc.label;
      }
    }
  }
  const results = Array.from(map.values()).map((loc) => {
    loc.evidence = deduplicateEvidence(loc.evidence);
    return loc;
  });
  return results.sort((a, b) => a.normalizedAddress.localeCompare(b.normalizedAddress));
}
function deduplicateContactForms(forms) {
  const map = /* @__PURE__ */ new Map();
  for (const f of forms) {
    const key = `${f.pageUrl.toLowerCase()}_${(f.formAction || "").toLowerCase()}_${(f.formIdOrName || "").toLowerCase()}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...f,
        evidence: [...f.evidence],
        sourceContributions: [...f.sourceContributions]
      });
    } else {
      existing.evidence = deduplicateEvidence([...existing.evidence, ...f.evidence]);
      existing.hasEmailField = existing.hasEmailField || f.hasEmailField;
      existing.hasPhoneField = existing.hasPhoneField || f.hasPhoneField;
      existing.hasMessageField = existing.hasMessageField || f.hasMessageField;
    }
  }
  const results = Array.from(map.values()).map((f) => {
    f.evidence = deduplicateEvidence(f.evidence);
    return f;
  });
  return results.sort((a, b) => a.pageUrl.localeCompare(b.pageUrl));
}

// src/extension/enrichment/contactExtractor.ts
function decodeHtmlEntities(str) {
  if (!str) return "";
  return str.replace(/&#64;/gi, "@").replace(/&#x40;/gi, "@").replace(/&commat;/gi, "@").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/&nbsp;/gi, " ");
}
function extractBusinessNamesFromHtml(html, pageUrl) {
  const facts = [];
  const decoded = decodeHtmlEntities(html);
  const jsonLdMatches = decoded.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const orgs = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of orgs) {
        const type = item["@type"];
        if (type === "Organization" || type === "LocalBusiness" || type === "Corporation" || type === "Store" || Array.isArray(type) && type.some((t) => t === "Organization" || t === "LocalBusiness")) {
          if (item.name && typeof item.name === "string") {
            const norm = normalizeBusinessNameFact(item.name);
            if (norm.status === "FOUND") {
              facts.push({
                rawValue: norm.rawValue,
                normalizedName: norm.normalizedName,
                comparisonKey: norm.comparisonKey,
                status: "FOUND",
                evidence: [
                  createContactEvidence({
                    field: "business_name",
                    rawValue: norm.rawValue,
                    normalizedValue: norm.normalizedName,
                    pageUrl,
                    evidenceType: "STRUCTURED_PAGE_CONTENT",
                    evidenceStrength: "DIRECT_PUBLIC_OBSERVATION",
                    contextSnippet: `JSON-LD Schema ${type}`
                  })
                ],
                provenance: "WEBSITE_DERIVED",
                sourceContributions: [
                  {
                    source: "FUTURE_SOURCE",
                    provenance: "WEBSITE_DERIVED",
                    fieldName: "business_name",
                    acquisitionContext: "WEBSITE_DIRECT",
                    restrictionBasis: "NONE",
                    isRestricted: false,
                    policyStatus: "POLICY_APPROVED",
                    persistenceStatus: "PERSISTABLE",
                    exportStatus: "EXPORTABLE"
                  }
                ]
              });
            }
          }
        }
      }
    } catch {
    }
  }
  const ogSiteName = decoded.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);
  if (ogSiteName && ogSiteName[1]) {
    const norm = normalizeBusinessNameFact(ogSiteName[1]);
    if (norm.status === "FOUND") {
      facts.push({
        rawValue: norm.rawValue,
        normalizedName: norm.normalizedName,
        comparisonKey: norm.comparisonKey,
        status: "FOUND",
        evidence: [
          createContactEvidence({
            field: "business_name",
            rawValue: norm.rawValue,
            normalizedValue: norm.normalizedName,
            pageUrl,
            evidenceType: "STRUCTURED_PAGE_CONTENT",
            evidenceStrength: "DIRECT_PUBLIC_OBSERVATION",
            contextSnippet: "meta og:site_name"
          })
        ],
        provenance: "WEBSITE_DERIVED",
        sourceContributions: [
          {
            source: "FUTURE_SOURCE",
            provenance: "WEBSITE_DERIVED",
            fieldName: "business_name",
            acquisitionContext: "WEBSITE_DIRECT",
            restrictionBasis: "NONE",
            isRestricted: false,
            policyStatus: "POLICY_APPROVED",
            persistenceStatus: "PERSISTABLE",
            exportStatus: "EXPORTABLE"
          }
        ]
      });
    }
  }
  const titleMatch = decoded.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    let rawTitle = titleMatch[1].trim();
    const segments = rawTitle.split(/\s+[-|:•–—]\s+/);
    const candidateName = segments[0]?.trim() || rawTitle;
    if (candidateName.length > 2 && candidateName.length < 80) {
      const norm = normalizeBusinessNameFact(candidateName);
      if (norm.status === "FOUND") {
        facts.push({
          rawValue: norm.rawValue,
          normalizedName: norm.normalizedName,
          comparisonKey: norm.comparisonKey,
          status: "FOUND",
          evidence: [
            createContactEvidence({
              field: "business_name",
              rawValue: norm.rawValue,
              normalizedValue: norm.normalizedName,
              pageUrl,
              evidenceType: "PAGE_TITLE",
              evidenceStrength: "DIRECT_PUBLIC_OBSERVATION",
              contextSnippet: `Title: ${rawTitle}`
            })
          ],
          provenance: "WEBSITE_DERIVED",
          sourceContributions: [
            {
              source: "FUTURE_SOURCE",
              provenance: "WEBSITE_DERIVED",
              fieldName: "business_name",
              acquisitionContext: "WEBSITE_DIRECT",
              restrictionBasis: "NONE",
              isRestricted: false,
              policyStatus: "POLICY_APPROVED",
              persistenceStatus: "PERSISTABLE",
              exportStatus: "EXPORTABLE"
            }
          ]
        });
      }
    }
  }
  return facts;
}
function extractPhonesFromHtml(html, pageUrl, countryHint) {
  const facts = [];
  const decoded = decodeHtmlEntities(html);
  const telRegex = /<a\b[^>]*\bhref=["']tel:([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const telMatches = decoded.matchAll(telRegex);
  for (const m of telMatches) {
    const rawTel = (m[1] || "").trim();
    const linkBody = sanitizeWebText(m[2] || "");
    const norm = normalizeBusinessPhone(rawTel, countryHint);
    if (norm.status === "FOUND" || norm.status === "AMBIGUOUS") {
      facts.push({
        rawValue: rawTel,
        normalizedValue: norm.normalizedValue,
        e164Format: norm.e164Format,
        nationalFormat: norm.nationalFormat,
        countryCode: norm.countryCode,
        dialCode: norm.dialCode,
        extension: norm.extension,
        phoneType: "GENERAL",
        status: norm.status,
        evidence: [
          createContactEvidence({
            field: "phone",
            rawValue: rawTel,
            normalizedValue: norm.normalizedValue,
            pageUrl,
            evidenceType: "TEL_LINK",
            evidenceStrength: "DIRECT_PUBLIC_OBSERVATION",
            contextSnippet: linkBody || `tel:${rawTel}`
          })
        ],
        provenance: "WEBSITE_DERIVED",
        sourceContributions: [
          {
            source: "FUTURE_SOURCE",
            provenance: "WEBSITE_DERIVED",
            fieldName: "phone",
            acquisitionContext: "WEBSITE_DIRECT",
            restrictionBasis: "NONE",
            isRestricted: false,
            policyStatus: "POLICY_APPROVED",
            persistenceStatus: "PERSISTABLE",
            exportStatus: "EXPORTABLE"
          }
        ]
      });
    }
  }
  const jsonLdMatches = decoded.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const tels = Array.isArray(item.telephone) ? item.telephone : item.telephone ? [item.telephone] : [];
        for (const t of tels) {
          if (typeof t === "string") {
            const norm = normalizeBusinessPhone(t, countryHint);
            if (norm.status === "FOUND" || norm.status === "AMBIGUOUS") {
              facts.push({
                rawValue: t,
                normalizedValue: norm.normalizedValue,
                e164Format: norm.e164Format,
                nationalFormat: norm.nationalFormat,
                countryCode: norm.countryCode,
                dialCode: norm.dialCode,
                phoneType: "GENERAL",
                status: norm.status,
                evidence: [
                  createContactEvidence({
                    field: "phone",
                    rawValue: t,
                    normalizedValue: norm.normalizedValue,
                    pageUrl,
                    evidenceType: "STRUCTURED_PAGE_CONTENT",
                    evidenceStrength: "DIRECT_PUBLIC_OBSERVATION",
                    contextSnippet: "JSON-LD schema telephone"
                  })
                ],
                provenance: "WEBSITE_DERIVED",
                sourceContributions: [
                  {
                    source: "FUTURE_SOURCE",
                    provenance: "WEBSITE_DERIVED",
                    fieldName: "phone",
                    acquisitionContext: "WEBSITE_DIRECT",
                    restrictionBasis: "NONE",
                    isRestricted: false,
                    policyStatus: "POLICY_APPROVED",
                    persistenceStatus: "PERSISTABLE",
                    exportStatus: "EXPORTABLE"
                  }
                ]
              });
            }
          }
        }
      }
    } catch {
    }
  }
  const cleanBody = decoded.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ").replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ").replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ").replace(/<[^>]+>/g, " ");
  const phonePattern = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}\b/g;
  const rawMatches = cleanBody.match(phonePattern) || [];
  for (const p of rawMatches) {
    const trimmed = p.trim();
    const digitCount = (trimmed.match(/\d/g) || []).length;
    if (digitCount >= 7 && digitCount <= 15) {
      const norm = normalizeBusinessPhone(trimmed, countryHint);
      if (norm.status === "FOUND" || norm.status === "AMBIGUOUS") {
        facts.push({
          rawValue: trimmed,
          normalizedValue: norm.normalizedValue,
          e164Format: norm.e164Format,
          nationalFormat: norm.nationalFormat,
          countryCode: norm.countryCode,
          dialCode: norm.dialCode,
          phoneType: "GENERAL",
          status: norm.status,
          evidence: [
            createContactEvidence({
              field: "phone",
              rawValue: trimmed,
              normalizedValue: norm.normalizedValue,
              pageUrl,
              evidenceType: "VISIBLE_TEXT",
              evidenceStrength: "DIRECT_PUBLIC_OBSERVATION",
              contextSnippet: `Visible text: ${trimmed}`
            })
          ],
          provenance: "WEBSITE_DERIVED",
          sourceContributions: [
            {
              source: "FUTURE_SOURCE",
              provenance: "WEBSITE_DERIVED",
              fieldName: "phone",
              acquisitionContext: "WEBSITE_DIRECT",
              restrictionBasis: "NONE",
              isRestricted: false,
              policyStatus: "POLICY_APPROVED",
              persistenceStatus: "PERSISTABLE",
              exportStatus: "EXPORTABLE"
            }
          ]
        });
      }
    }
  }
  return facts;
}
function extractEmailsFromHtml(html, pageUrl) {
  const facts = [];
  const decoded = decodeHtmlEntities(html);
  const mailtoRegex = /<a\b[^>]*\bhref=["']mailto:([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const mailtoMatches = decoded.matchAll(mailtoRegex);
  for (const m of mailtoMatches) {
    const rawMailto = (m[1] || "").trim();
    const linkBody = sanitizeWebText(m[2] || "");
    const norm = normalizeBusinessEmail(rawMailto);
    if (norm.status === "FOUND") {
      facts.push({
        rawValue: rawMailto,
        normalizedEmail: norm.normalizedEmail,
        localPart: norm.localPart,
        domainPart: norm.domainPart,
        emailType: norm.emailType,
        status: "FOUND",
        evidence: [
          createContactEvidence({
            field: "email",
            rawValue: rawMailto,
            normalizedValue: norm.normalizedEmail,
            pageUrl,
            evidenceType: "MAILTO_LINK",
            evidenceStrength: "DIRECT_PUBLIC_OBSERVATION",
            contextSnippet: linkBody || `mailto:${rawMailto}`
          })
        ],
        provenance: "WEBSITE_DERIVED",
        sourceContributions: [
          {
            source: "FUTURE_SOURCE",
            provenance: "WEBSITE_DERIVED",
            fieldName: "email",
            acquisitionContext: "WEBSITE_DIRECT",
            restrictionBasis: "NONE",
            isRestricted: false,
            policyStatus: "POLICY_APPROVED",
            persistenceStatus: "PERSISTABLE",
            exportStatus: "EXPORTABLE"
          }
        ]
      });
    }
  }
  const jsonLdMatches = decoded.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const emails = Array.isArray(item.email) ? item.email : item.email ? [item.email] : [];
        for (const e of emails) {
          if (typeof e === "string") {
            const norm = normalizeBusinessEmail(e);
            if (norm.status === "FOUND") {
              facts.push({
                rawValue: e,
                normalizedEmail: norm.normalizedEmail,
                localPart: norm.localPart,
                domainPart: norm.domainPart,
                emailType: norm.emailType,
                status: "FOUND",
                evidence: [
                  createContactEvidence({
                    field: "email",
                    rawValue: e,
                    normalizedValue: norm.normalizedEmail,
                    pageUrl,
                    evidenceType: "STRUCTURED_PAGE_CONTENT",
                    evidenceStrength: "DIRECT_PUBLIC_OBSERVATION",
                    contextSnippet: "JSON-LD schema email"
                  })
                ],
                provenance: "WEBSITE_DERIVED",
                sourceContributions: [
                  {
                    source: "FUTURE_SOURCE",
                    provenance: "WEBSITE_DERIVED",
                    fieldName: "email",
                    acquisitionContext: "WEBSITE_DIRECT",
                    restrictionBasis: "NONE",
                    isRestricted: false,
                    policyStatus: "POLICY_APPROVED",
                    persistenceStatus: "PERSISTABLE",
                    exportStatus: "EXPORTABLE"
                  }
                ]
              });
            }
          }
        }
      }
    } catch {
    }
  }
  const obfuscatedRegex = /\b([a-zA-Z0-9._%+-]+)\s*(?:\[at\]|\(at\)|\[@\]|@)\s*([a-zA-Z0-9.-]+)\s*(?:\[dot\]|\(dot\)|\.)\s*([a-zA-Z]{2,})\b/gi;
  const obfMatches = decoded.matchAll(obfuscatedRegex);
  for (const m of obfMatches) {
    const rawObf = m[0];
    const deobfuscated = `${m[1]}@${m[2]}.${m[3]}`.toLowerCase();
    const norm = normalizeBusinessEmail(deobfuscated);
    if (norm.status === "FOUND") {
      facts.push({
        rawValue: rawObf,
        normalizedEmail: norm.normalizedEmail,
        localPart: norm.localPart,
        domainPart: norm.domainPart,
        emailType: norm.emailType,
        status: "FOUND",
        evidence: [
          createContactEvidence({
            field: "email",
            rawValue: rawObf,
            normalizedValue: norm.normalizedEmail,
            pageUrl,
            evidenceType: "VISIBLE_TEXT",
            evidenceStrength: "DIRECT_PUBLIC_OBSERVATION",
            contextSnippet: `Deobfuscated text: ${rawObf}`
          })
        ],
        provenance: "WEBSITE_DERIVED",
        sourceContributions: [
          {
            source: "FUTURE_SOURCE",
            provenance: "WEBSITE_DERIVED",
            fieldName: "email",
            acquisitionContext: "WEBSITE_DIRECT",
            restrictionBasis: "NONE",
            isRestricted: false,
            policyStatus: "POLICY_APPROVED",
            persistenceStatus: "PERSISTABLE",
            exportStatus: "EXPORTABLE"
          }
        ]
      });
    }
  }
  const cleanBody = decoded.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ").replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ").replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ").replace(/<[^>]+>/g, " ");
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const rawEmails = cleanBody.match(emailRegex) || [];
  for (const e of rawEmails) {
    const norm = normalizeBusinessEmail(e);
    if (norm.status === "FOUND") {
      facts.push({
        rawValue: e,
        normalizedEmail: norm.normalizedEmail,
        localPart: norm.localPart,
        domainPart: norm.domainPart,
        emailType: norm.emailType,
        status: "FOUND",
        evidence: [
          createContactEvidence({
            field: "email",
            rawValue: e,
            normalizedValue: norm.normalizedEmail,
            pageUrl,
            evidenceType: "VISIBLE_TEXT",
            evidenceStrength: "DIRECT_PUBLIC_OBSERVATION",
            contextSnippet: `Visible text: ${e}`
          })
        ],
        provenance: "WEBSITE_DERIVED",
        sourceContributions: [
          {
            source: "FUTURE_SOURCE",
            provenance: "WEBSITE_DERIVED",
            fieldName: "email",
            acquisitionContext: "WEBSITE_DIRECT",
            restrictionBasis: "NONE",
            isRestricted: false,
            policyStatus: "POLICY_APPROVED",
            persistenceStatus: "PERSISTABLE",
            exportStatus: "EXPORTABLE"
          }
        ]
      });
    }
  }
  return facts;
}
function extractLocationsFromHtml(html, pageUrl, countryHint) {
  const facts = [];
  const decoded = decodeHtmlEntities(html);
  const jsonLdMatches = decoded.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const addresses = [];
        if (item["@type"] === "PostalAddress") {
          addresses.push(item);
        } else if (item.address) {
          if (Array.isArray(item.address)) {
            addresses.push(...item.address);
          } else {
            addresses.push(item.address);
          }
        }
        if (item.department && Array.isArray(item.department)) {
          for (const dep of item.department) {
            if (dep.address) addresses.push(dep.address);
          }
        }
        for (const addr of addresses) {
          if (typeof addr === "string") {
            const norm = normalizeBusinessAddress(addr, countryHint);
            if (norm.status === "FOUND" || norm.status === "PARTIAL") {
              facts.push({
                id: `loc_${pageUrl}_${norm.normalizedAddress.slice(0, 30)}`.replace(/[^a-z0-9]/gi, "_"),
                rawAddress: addr,
                normalizedAddress: norm.normalizedAddress,
                postalCode: norm.postalCode,
                country: norm.country,
                status: norm.status,
                evidence: [
                  createContactEvidence({
                    field: "address",
                    rawValue: addr,
                    normalizedValue: norm.normalizedAddress,
                    pageUrl,
                    evidenceType: "STRUCTURED_PAGE_CONTENT",
                    evidenceStrength: "DIRECT_PUBLIC_OBSERVATION",
                    contextSnippet: "JSON-LD schema address"
                  })
                ],
                provenance: "WEBSITE_DERIVED",
                sourceContributions: [
                  {
                    source: "FUTURE_SOURCE",
                    provenance: "WEBSITE_DERIVED",
                    fieldName: "address",
                    acquisitionContext: "WEBSITE_DIRECT",
                    restrictionBasis: "NONE",
                    isRestricted: false,
                    policyStatus: "POLICY_APPROVED",
                    persistenceStatus: "PERSISTABLE",
                    exportStatus: "EXPORTABLE"
                  }
                ]
              });
            }
          } else if (typeof addr === "object" && addr !== null) {
            const parts = [
              addr.streetAddress,
              addr.addressLocality,
              addr.addressRegion,
              addr.postalCode,
              addr.addressCountry
            ].filter(Boolean);
            if (parts.length > 0) {
              const rawStr = parts.join(", ");
              const norm = normalizeBusinessAddress(rawStr, countryHint);
              facts.push({
                id: `loc_${pageUrl}_${norm.normalizedAddress.slice(0, 30)}`.replace(/[^a-z0-9]/gi, "_"),
                label: item.name ? String(item.name) : void 0,
                rawAddress: rawStr,
                normalizedAddress: norm.normalizedAddress,
                streetAddress: addr.streetAddress ? String(addr.streetAddress) : void 0,
                city: addr.addressLocality ? String(addr.addressLocality) : void 0,
                region: addr.addressRegion ? String(addr.addressRegion) : void 0,
                postalCode: addr.postalCode ? String(addr.postalCode) : norm.postalCode,
                country: addr.addressCountry ? String(addr.addressCountry) : norm.country,
                phone: item.telephone ? String(item.telephone) : void 0,
                status: norm.status,
                evidence: [
                  createContactEvidence({
                    field: "address",
                    rawValue: rawStr,
                    normalizedValue: norm.normalizedAddress,
                    pageUrl,
                    evidenceType: "STRUCTURED_PAGE_CONTENT",
                    evidenceStrength: "DIRECT_PUBLIC_OBSERVATION",
                    contextSnippet: "JSON-LD PostalAddress"
                  })
                ],
                provenance: "WEBSITE_DERIVED",
                sourceContributions: [
                  {
                    source: "FUTURE_SOURCE",
                    provenance: "WEBSITE_DERIVED",
                    fieldName: "address",
                    acquisitionContext: "WEBSITE_DIRECT",
                    restrictionBasis: "NONE",
                    isRestricted: false,
                    policyStatus: "POLICY_APPROVED",
                    persistenceStatus: "PERSISTABLE",
                    exportStatus: "EXPORTABLE"
                  }
                ]
              });
            }
          }
        }
      }
    } catch {
    }
  }
  const addressRegex = /<address\b[^>]*>([\s\S]*?)<\/address>/gi;
  const addressMatches = decoded.matchAll(addressRegex);
  for (const m of addressMatches) {
    const rawTag = m[1];
    const textOnly = sanitizeWebText(rawTag);
    if (textOnly && textOnly.length >= 8) {
      const norm = normalizeBusinessAddress(textOnly, countryHint);
      if (norm.status === "FOUND" || norm.status === "PARTIAL") {
        facts.push({
          id: `loc_${pageUrl}_${norm.normalizedAddress.slice(0, 30)}`.replace(/[^a-z0-9]/gi, "_"),
          rawAddress: textOnly,
          normalizedAddress: norm.normalizedAddress,
          postalCode: norm.postalCode,
          country: norm.country,
          status: norm.status,
          evidence: [
            createContactEvidence({
              field: "address",
              rawValue: textOnly,
              normalizedValue: norm.normalizedAddress,
              pageUrl,
              evidenceType: "VISIBLE_TEXT",
              evidenceStrength: "DIRECT_PUBLIC_OBSERVATION",
              contextSnippet: `<address> tag: ${textOnly.slice(0, 100)}`
            })
          ],
          provenance: "WEBSITE_DERIVED",
          sourceContributions: [
            {
              source: "FUTURE_SOURCE",
              provenance: "WEBSITE_DERIVED",
              fieldName: "address",
              acquisitionContext: "WEBSITE_DIRECT",
              restrictionBasis: "NONE",
              isRestricted: false,
              policyStatus: "POLICY_APPROVED",
              persistenceStatus: "PERSISTABLE",
              exportStatus: "EXPORTABLE"
            }
          ]
        });
      }
    }
  }
  return facts;
}
function extractContactFormsFromHtml(html, pageUrl) {
  const forms = [];
  const decoded = decodeHtmlEntities(html);
  const formRegex = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
  const matches = decoded.matchAll(formRegex);
  let formIndex = 0;
  for (const m of matches) {
    formIndex++;
    const formAttrs = m[1] || "";
    const formBody = m[2] || "";
    const actionMatch = formAttrs.match(/\baction=["']([^"']*)["']/i);
    const methodMatch = formAttrs.match(/\bmethod=["']([^"']*)["']/i);
    const idMatch = formAttrs.match(/\b(?:id|name)=["']([^"']*)["']/i);
    const action = actionMatch ? actionMatch[1].trim() : void 0;
    const method = methodMatch ? methodMatch[1].trim().toUpperCase() : "GET";
    const formId = idMatch ? idMatch[1].trim() : void 0;
    const lowerAttrs = formAttrs.toLowerCase();
    const lowerBody = formBody.toLowerCase();
    const hasEmailField = /type=["']email["']|name=["'][^"']*(?:email|e-mail)[^"']*["']/i.test(formBody);
    const hasPhoneField = /type=["']tel["']|name=["'][^"']*(?:phone|tel|mobile)[^"']*["']/i.test(formBody);
    const hasMessageField = /<textarea\b|name=["'][^"']*(?:message|comment|inquiry|body)[^"']*["']/i.test(formBody);
    const isContactIntent = lowerAttrs.includes("contact") || lowerAttrs.includes("feedback") || lowerAttrs.includes("inquiry") || lowerAttrs.includes("get-in-touch") || lowerBody.includes("send message") || lowerBody.includes("submit inquiry") || lowerBody.includes("contact us") || hasMessageField || hasEmailField && (hasPhoneField || lowerBody.includes("name"));
    const isSearchOnly = lowerAttrs.includes("search") || lowerBody.includes("search") && !hasMessageField && !hasEmailField;
    if (isContactIntent && !isSearchOnly) {
      const factId = `form_${pageUrl}_${formIndex}`.replace(/[^a-z0-9]/gi, "_");
      forms.push({
        id: factId,
        present: true,
        pageUrl,
        formAction: action,
        formMethod: method,
        formIdOrName: formId,
        hasEmailField,
        hasPhoneField,
        hasMessageField,
        evidence: [
          createContactEvidence({
            field: "contact_form",
            rawValue: `form_${formId || formIndex}`,
            normalizedValue: action || pageUrl,
            pageUrl,
            evidenceType: "CONTACT_FORM",
            evidenceStrength: "DIRECT_PUBLIC_OBSERVATION",
            contextSnippet: `Contact form detected (method=${method}, hasEmail=${hasEmailField}, hasMessage=${hasMessageField})`
          })
        ],
        provenance: "WEBSITE_DERIVED",
        sourceContributions: [
          {
            source: "FUTURE_SOURCE",
            provenance: "WEBSITE_DERIVED",
            fieldName: "contact_form",
            acquisitionContext: "WEBSITE_DIRECT",
            restrictionBasis: "NONE",
            isRestricted: false,
            policyStatus: "POLICY_APPROVED",
            persistenceStatus: "PERSISTABLE",
            exportStatus: "EXPORTABLE"
          }
        ]
      });
    }
  }
  return forms;
}
function extractContactsFromHtmlPage(html, pageUrl, countryHint) {
  const rawBusinessNames = extractBusinessNamesFromHtml(html, pageUrl);
  const rawPhones = extractPhonesFromHtml(html, pageUrl, countryHint);
  const rawEmails = extractEmailsFromHtml(html, pageUrl);
  const rawLocations = extractLocationsFromHtml(html, pageUrl, countryHint);
  const rawContactForms = extractContactFormsFromHtml(html, pageUrl);
  return {
    businessNames: rawBusinessNames,
    phones: deduplicatePhones(rawPhones),
    emails: deduplicateEmails(rawEmails),
    locations: deduplicateLocations(rawLocations),
    contactForms: deduplicateContactForms(rawContactForms)
  };
}

// src/extension/enrichment/digitalPresenceExtractor.ts
var PLATFORM_PATTERNS = [
  {
    platform: "FACEBOOK",
    hostPatterns: ["facebook.com", "fb.com", "fb.me", "m.facebook.com"],
    bannedPaths: ["/sharer", "/share", "/dialog", "/login", "/signup", "/help", "/policy"]
  },
  {
    platform: "INSTAGRAM",
    hostPatterns: ["instagram.com", "instagr.am"],
    bannedPaths: ["/accounts", "/explore", "/developer", "/about"]
  },
  {
    platform: "LINKEDIN",
    hostPatterns: ["linkedin.com"],
    bannedPaths: ["/sharearticle", "/sharing", "/share", "/login", "/signup", "/help", "/legal"]
  },
  {
    platform: "YOUTUBE",
    hostPatterns: ["youtube.com", "youtu.be"],
    bannedPaths: ["/watch", "/embed", "/results", "/feed", "/t/terms", "/howyoutubeworks"]
  },
  {
    platform: "TIKTOK",
    hostPatterns: ["tiktok.com"],
    bannedPaths: ["/share", "/login", "/tag", "/legal"]
  },
  {
    platform: "TWITTER_X",
    hostPatterns: ["twitter.com", "x.com", "t.co"],
    bannedPaths: ["/intent", "/share", "/home", "/login", "/privacy", "/tos"]
  },
  {
    platform: "GITHUB",
    hostPatterns: ["github.com"],
    bannedPaths: ["/login", "/join", "/features", "/pricing", "/about"]
  },
  {
    platform: "PINTEREST",
    hostPatterns: ["pinterest.com"],
    bannedPaths: ["/pin/create", "/resource", "/about", "/business"]
  }
];
function extractDigitalPresenceFromHtml(html, pageUrl) {
  const facts = [];
  const normHtml = html || "";
  const anchorRegex = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const matches = normHtml.matchAll(anchorRegex);
  for (const m of matches) {
    const rawHref = (m[1] || "").trim();
    const anchorBody = (m[2] || "").trim();
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:") || rawHref.startsWith("javascript:")) {
      continue;
    }
    let parsedUrl;
    try {
      parsedUrl = new URL(rawHref, pageUrl);
    } catch {
      continue;
    }
    const host = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");
    const pathname = parsedUrl.pathname.toLowerCase();
    for (const pat of PLATFORM_PATTERNS) {
      if (pat.hostPatterns.some((p) => host === p || host.endsWith(`.${p}`))) {
        if (pat.bannedPaths.some((bp) => pathname.startsWith(bp) || pathname.includes(bp))) {
          continue;
        }
        const cleanPath = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
        if (!cleanPath) {
          continue;
        }
        const norm = normalizeSocialUrl(parsedUrl.toString());
        if (!norm.isValid || norm.isShareWidget) {
          continue;
        }
        const snippet = anchorBody.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || `${pat.platform} profile link`;
        const evidence = createContactEvidence({
          field: "social",
          rawValue: rawHref,
          normalizedValue: norm.normalizedUrl,
          pageUrl,
          evidenceType: "ANCHOR_LINK",
          evidenceStrength: "DIRECT_PUBLIC_OBSERVATION",
          contextSnippet: snippet.slice(0, 150)
        });
        facts.push({
          platform: pat.platform,
          rawUrl: rawHref,
          normalizedUrl: norm.normalizedUrl,
          domain: norm.domain,
          handleOrPath: norm.handleOrPath,
          pageObserved: pageUrl,
          status: "FOUND",
          evidence: [evidence],
          provenance: "WEBSITE_DERIVED",
          sourceContributions: [
            {
              source: "FUTURE_SOURCE",
              provenance: "WEBSITE_DERIVED",
              fieldName: `social_${pat.platform.toLowerCase()}`,
              acquisitionContext: "WEBSITE_DIRECT",
              restrictionBasis: "NONE",
              isRestricted: false,
              policyStatus: "POLICY_APPROVED",
              persistenceStatus: "PERSISTABLE",
              exportStatus: "EXPORTABLE"
            }
          ]
        });
        break;
      }
    }
  }
  return facts;
}

// src/extension/websiteIntelligence/websiteIntelligenceEngine.ts
var defaultObservationCache = new BoundedObservationCache({
  maxEntries: DEFAULT_MAX_CACHE_ENTRIES,
  maxBytes: DEFAULT_MAX_CACHE_BYTES,
  defaultTtlMs: DEFAULT_CACHE_TTL_MS
});
var WebsiteIntelligenceEngine = class {
  constructor(customCache) {
    this.isCancelled = false;
    this.activeAbortController = null;
    this._lastFailedPages = [];
    this._lastDiscoveredCount = 0;
    this.observationCache = customCache || defaultObservationCache;
  }
  /**
   * Diagnostic cache stats.
   */
  getCacheStats() {
    return this.observationCache.getStats();
  }
  /**
   * Clears the observation cache.
   */
  clearCache() {
    this.observationCache.clear();
  }
  /**
   * Returns internal bounded observation cache instance.
   */
  getObservationCache() {
    return this.observationCache;
  }
  /**
   * Cleans and formats plain text from HTML, stripping script, style, and HTML tags.
   */
  cleanText(raw) {
    return (raw || "").replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "").replace(/<[^>]*>/g, "").normalize("NFC").replace(/\s+/g, " ").trim();
  }
  /**
   * Verifies the target domain reachability and basic business identity matching.
   */
  async verifyDomain(input) {
    const safety = validateSafeWebUrl(input.targetUrl);
    if (!safety.isSafe) {
      return "INVALID";
    }
    return "VERIFIED";
  }
  /**
   * Executes bounded, cancellable same-origin crawl up to maxPages (default 5).
   */
  async crawl(input, customFetch) {
    const cfg = input.config || {};
    const maxPages = cfg.maxPages ?? DEFAULT_MAX_PAGES_PER_DOMAIN;
    const pageTimeoutMs = cfg.pageTimeoutMs ?? DEFAULT_MAX_PAGE_TIMEOUT_MS;
    const domainTimeoutMs = cfg.domainTimeoutMs ?? DEFAULT_MAX_DOMAIN_TIMEOUT_MS;
    const maxDocBytes = cfg.maxDocumentBytes ?? DEFAULT_MAX_DOCUMENT_BYTES;
    const safety = validateSafeWebUrl(input.targetUrl);
    if (!safety.isSafe || !safety.normalizedUrl) {
      throw new Error(`[WebsiteIntelligenceEngine] Invalid target URL: ${safety.reason}`);
    }
    const rootUrl = safety.normalizedUrl;
    const baseOrigin = new URL(rootUrl).origin;
    const startTime = Date.now();
    const fetchedPages = [];
    const visitedUrls = /* @__PURE__ */ new Set();
    this.activeAbortController = new AbortController();
    const MAX_REDIRECTS = 5;
    const safeFetchWithRedirects = async (initialUrl, timeoutMs) => {
      let currentUrl = initialUrl;
      let hops = 0;
      while (hops <= MAX_REDIRECTS) {
        const hopSafety = validateSafeWebUrl(currentUrl);
        if (!hopSafety.isSafe) {
          throw new Error(`[WebsiteIntelligenceEngine] SSRF blocked destination: ${hopSafety.reason}`);
        }
        if (!isSafeSameOrigin(currentUrl, baseOrigin)) {
          throw new Error(`[WebsiteIntelligenceEngine] Cross-origin crawl target blocked: ${currentUrl}`);
        }
        let status = 0;
        let html = "";
        let locationHeader;
        if (customFetch) {
          const res = await customFetch(currentUrl, timeoutMs);
          status = res.status;
          html = res.html || "";
          locationHeader = res.headers?.location || res.headers?.Location || res.redirectUrl || res.location;
        } else {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeoutMs);
          const cancelListener = () => controller.abort();
          this.activeAbortController?.signal.addEventListener("abort", cancelListener);
          try {
            const resp = await fetch(currentUrl, {
              method: "GET",
              headers: { Accept: "text/html,application/xhtml+xml" },
              redirect: "manual",
              // Enforce manual per-hop redirect validation
              signal: controller.signal
            });
            clearTimeout(timer);
            this.activeAbortController?.signal.removeEventListener("abort", cancelListener);
            status = resp.status;
            locationHeader = resp.headers.get("location") || void 0;
            if (status < 300 || status >= 400 || !locationHeader) {
              html = await resp.text();
            }
          } catch (err) {
            clearTimeout(timer);
            this.activeAbortController?.signal.removeEventListener("abort", cancelListener);
            throw err;
          }
        }
        if (status >= 300 && status < 400 && locationHeader) {
          const redirectValidation = validateRedirectHop(locationHeader, currentUrl, baseOrigin);
          if (!redirectValidation.isSafe || !redirectValidation.resolvedUrl) {
            throw new Error(
              `[WebsiteIntelligenceEngine] Blocked unsafe redirect: ${redirectValidation.reason}`
            );
          }
          currentUrl = redirectValidation.resolvedUrl;
          hops++;
          continue;
        }
        if (html.length > maxDocBytes) {
          html = html.slice(0, maxDocBytes);
        }
        return { status, html, finalUrl: currentUrl };
      }
      throw new Error("[WebsiteIntelligenceEngine] Exceeded maximum redirect hops (5)");
    };
    this._lastFailedPages = [];
    this._lastDiscoveredCount = 0;
    let homepageHtml = "";
    try {
      if (this.isCancelled) return fetchedPages;
      const homeRes = await safeFetchWithRedirects(rootUrl, pageTimeoutMs);
      homepageHtml = homeRes.html;
      visitedUrls.add(homeRes.finalUrl.replace(/\/$/, ""));
      fetchedPages.push({ url: homeRes.finalUrl, html: homeRes.html, status: homeRes.status });
    } catch {
      return fetchedPages;
    }
    const candidateLinks = extractCandidateLinksFromHtml(homepageHtml, rootUrl);
    const discoveryPlan = buildDiscoveryPlan(rootUrl, candidateLinks, maxPages);
    this._lastDiscoveredCount = 1 + discoveryPlan.length;
    for (const pageUrl of discoveryPlan) {
      if (this.isCancelled) break;
      if (Date.now() - startTime >= domainTimeoutMs) break;
      if (fetchedPages.length >= maxPages) break;
      const normUrl = pageUrl.replace(/\/$/, "");
      if (visitedUrls.has(normUrl)) continue;
      visitedUrls.add(normUrl);
      try {
        const pageRes = await safeFetchWithRedirects(pageUrl, pageTimeoutMs);
        fetchedPages.push({ url: pageRes.finalUrl, html: pageRes.html, status: pageRes.status });
      } catch {
        this._lastFailedPages.push(pageUrl);
      }
    }
    return fetchedPages;
  }
  /**
   * Extracts multi-page business intelligence from crawled HTML pages.
   */
  extract(pages, input) {
    const allPhones = [];
    const allEmails = [];
    const allLocations = [];
    const allSocial = [];
    const allPeople = [];
    const allServices = [];
    const allDescriptions = [];
    const allTech = [];
    const allForms = [];
    const allEvidence = [];
    let canonicalUrl = input.targetUrl;
    let pageTitle = "";
    let metaDescription = "";
    let businessName;
    let businessHours;
    const serviceAreas = /* @__PURE__ */ new Set();
    const categories = /* @__PURE__ */ new Set();
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const isHome = i === 0;
      if (isHome) {
        const tMatch = page.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        if (tMatch) pageTitle = this.cleanText(tMatch[1]);
        let mMatch = page.html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)["']/i);
        if (!mMatch) {
          mMatch = page.html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](?:description|og:description)["']/i);
        }
        if (mMatch) {
          metaDescription = this.cleanText(mMatch[1]);
          allDescriptions.push({
            text: metaDescription,
            sourceType: "META_DESC",
            sourceUrl: page.url,
            observedAt: (/* @__PURE__ */ new Date()).toISOString(),
            provenance: "WEBSITE_DERIVED"
          });
        }
        const canonMatch = page.html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
        if (canonMatch) canonicalUrl = canonMatch[1].trim();
      }
      const pageContacts = extractContactsFromHtmlPage(page.html, page.url);
      allPhones.push(...pageContacts.phones);
      allEmails.push(...pageContacts.emails);
      allLocations.push(...pageContacts.locations);
      allForms.push(...pageContacts.contactForms);
      if (pageContacts.businessNames.length > 0 && !businessName) {
        businessName = pageContacts.businessNames[0].normalizedName;
      }
      const social = extractDigitalPresenceFromHtml(page.html, page.url);
      allSocial.push(...social);
      if (input.config?.collectPeople !== false) {
        const people = extractPublicPeople(page.html, page.url);
        allPeople.push(...people);
      }
      if (input.config?.collectServices !== false) {
        const services = extractPublicServices(page.html, page.url);
        allServices.push(...services);
      }
      if (input.config?.detectTechnology !== false) {
        const tech = detectTechnologiesInHtml(page.html);
        for (const t of tech) {
          if (!allTech.some((existing) => existing.name === t.name)) {
            allTech.push(t);
          }
        }
      }
      const ldMatches = page.html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      for (const m of ldMatches) {
        try {
          const parsed = JSON.parse(m[1].trim());
          const items = Array.isArray(parsed) ? parsed : [parsed];
          for (const item of items) {
            if (!item || typeof item !== "object") continue;
            if (item.description && typeof item.description === "string" && !allDescriptions.some((d) => d.text === item.description)) {
              allDescriptions.push({
                text: this.cleanText(item.description),
                sourceType: "STRUCTURED_DATA",
                sourceUrl: page.url,
                observedAt: (/* @__PURE__ */ new Date()).toISOString(),
                provenance: "WEBSITE_DERIVED"
              });
            }
            if (item.openingHours && !businessHours) {
              businessHours = Array.isArray(item.openingHours) ? item.openingHours.join(", ") : String(item.openingHours);
            }
            if (item.areaServed) {
              const areas = Array.isArray(item.areaServed) ? item.areaServed : [item.areaServed];
              for (const a of areas) {
                const name = typeof a === "string" ? a : a?.name;
                if (typeof name === "string") serviceAreas.add(this.cleanText(name));
              }
            }
          }
        } catch {
        }
      }
    }
    const dedupedPhones = deduplicatePhones(allPhones);
    const dedupedEmails = deduplicateEmails(allEmails);
    const dedupedLocations = deduplicateLocations(allLocations);
    for (const p of dedupedPhones) allEvidence.push(...p.evidence);
    for (const e of dedupedEmails) allEvidence.push(...e.evidence);
    for (const l of dedupedLocations) allEvidence.push(...l.evidence);
    const uniquePeople = [];
    for (const p of allPeople) {
      if (!uniquePeople.some((u) => u.fullName.toLowerCase() === p.fullName.toLowerCase())) {
        uniquePeople.push(p);
      }
    }
    const uniqueServices = [];
    for (const s of allServices) {
      if (!uniqueServices.some((u) => u.name.toLowerCase() === s.name.toLowerCase())) {
        uniqueServices.push(s);
      }
    }
    const uniqueSocial = [];
    for (const s of allSocial) {
      if (!uniqueSocial.some((u) => u.platform === s.platform && u.normalizedUrl === s.normalizedUrl)) {
        uniqueSocial.push(s);
      }
    }
    const domain = new URL(canonicalUrl).hostname.toLowerCase().replace(/^www\./, "");
    const identity = {
      canonicalUrl,
      domain,
      pageTitle,
      businessName,
      description: allDescriptions[0]?.text,
      metaDescription,
      address: dedupedLocations[0]?.normalizedAddress,
      phones: dedupedPhones.map((p) => p.normalizedValue),
      emails: dedupedEmails.map((e) => e.normalizedEmail),
      businessHours,
      serviceAreas: Array.from(serviceAreas),
      services: uniqueServices.map((s) => s.name),
      categories: Array.from(categories)
    };
    return {
      identity,
      phones: dedupedPhones,
      emails: dedupedEmails,
      locations: dedupedLocations,
      socialProfiles: uniqueSocial,
      people: uniquePeople,
      services: uniqueServices,
      descriptions: allDescriptions,
      technologies: allTech,
      contactForms: allForms,
      allEvidence
    };
  }
  /**
   * Applies source restrictions and emits final structured WebsiteIntelligenceResult.
   *
   * MANDATORY GOOGLE INVARIANT:
   * If sourceContext is GOOGLE_MAPS or carries Google restrictions,
   * all resulting source contributions enforce NOT_PERSISTABLE and NOT_EXPORTABLE,
   * preventing any circumvention of Google data restrictions.
   */
  emitEvidence(extracted, input, crawlStats) {
    const isGoogleRestricted = input.sourceContext === "GOOGLE_MAPS" || input.provenanceContext === "GOOGLE_DERIVED" || input.sourceRestrictions?.isRestricted === true;
    const conflicts = detectAllConflicts(
      extracted.phones,
      extracted.locations,
      extracted.emails
    );
    const sourceContributions = [];
    const makeContribution = (fieldName, provenance) => {
      if (isGoogleRestricted) {
        return {
          source: "GOOGLE_MAPS",
          provenance: "GOOGLE_DERIVED",
          fieldName,
          acquisitionContext: "GOOGLE_CONSUMER_WEB",
          restrictionBasis: "GOOGLE_CONSUMER_WEB_RESTRICTED",
          isRestricted: true,
          policyStatus: "PRODUCT_REJECTED",
          persistenceStatus: "NOT_PERSISTABLE",
          exportStatus: "NOT_EXPORTABLE"
        };
      }
      let sourceVal = "FUTURE_SOURCE";
      if (input.sourceContext === "META" || input.sourceContext === "META_AD_LIBRARY") {
        sourceVal = "META_AD_LIBRARY";
      } else if (input.sourceContext === "USER_PROVIDED" || input.sourceContext === "USER_PROVIDED_DOMAIN") {
        sourceVal = "USER_PROVIDED_DOMAIN";
      }
      return {
        source: sourceVal,
        provenance,
        fieldName,
        acquisitionContext: "WEBSITE_DIRECT",
        restrictionBasis: "NONE",
        isRestricted: false,
        policyStatus: "POLICY_APPROVED",
        persistenceStatus: "PERSISTABLE",
        exportStatus: "EXPORTABLE"
      };
    };
    sourceContributions.push(makeContribution("website_identity", "WEBSITE_DERIVED"));
    sourceContributions.push(makeContribution("contact_details", "WEBSITE_DERIVED"));
    if (extracted.technologies.length > 0) {
      sourceContributions.push(makeContribution("technology_signals", "LEADNORIA_DERIVED"));
    }
    let verificationState = "VERIFIED";
    if (crawlStats.pagesVisited.length === 0) {
      verificationState = "UNREACHABLE";
    } else if (extracted.identity.businessName && input.businessContext?.expectedName) {
      const expected = input.businessContext.expectedName.toLowerCase();
      const observed = extracted.identity.businessName.toLowerCase();
      if (!observed.includes(expected) && !expected.includes(observed)) {
        verificationState = "LIKELY";
      }
    }
    return {
      identity: extracted.identity,
      contacts: extracted.allEvidence,
      phones: extracted.phones,
      emails: extracted.emails,
      socialProfiles: extracted.socialProfiles,
      publicPeople: extracted.people,
      address: extracted.locations[0],
      services: extracted.services,
      description: extracted.descriptions[0],
      businessHours: extracted.identity.businessHours,
      technologySignals: extracted.technologies,
      contactForms: extracted.contactForms,
      sourcePages: crawlStats.pagesVisited,
      crawlStats,
      verificationState,
      conflicts,
      warnings: [],
      provenance: isGoogleRestricted ? "GOOGLE_DERIVED" : "WEBSITE_DERIVED",
      sourceContributions,
      observedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Main end-to-end processing pipeline for a target website.
   * Performs verify -> crawl -> extract -> emit with isolated neutral observation caching.
   *
   * BLOCKER A & B ENFORCEMENT:
   * 1. Caches only neutral observations (extracted facts, crawl stats).
   * 2. Keyed by normalized origin + path scope + crawl config.
   * 3. Dynamically re-binds provenance and restrictions to current request on cache hit.
   * 4. Enforces bounded memory limits via BoundedObservationCache (MAX_CACHE_ENTRIES, MAX_CACHE_BYTES).
   */
  async process(input, customFetch) {
    const safety = validateSafeWebUrl(input.targetUrl);
    if (!safety.isSafe || !safety.normalizedUrl) {
      throw new Error(`[WebsiteIntelligenceEngine] Rejected unsafe URL: ${safety.reason}`);
    }
    const cacheKey = generateObservationCacheKey(input.targetUrl, input.config);
    const cacheTtl = input.config?.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
    const cachedPayload = this.observationCache.get(cacheKey);
    if (cachedPayload) {
      const crawlStats2 = {
        ...cachedPayload.crawlStats,
        fromCache: true
      };
      return this.emitEvidence(cachedPayload.extracted, input, crawlStats2);
    }
    const startTime = Date.now();
    const pages = await this.crawl(input, customFetch);
    const crawlStats = {
      pagesDiscovered: Math.max(pages.length, this._lastDiscoveredCount),
      pagesVisited: pages.map((p) => p.url),
      pagesSkipped: [],
      pagesFailed: [...this._lastFailedPages],
      durationMs: Date.now() - startTime,
      fromCache: false
    };
    const extracted = this.extract(pages, input);
    if (pages.length > 0) {
      const domain = safety.parsedUrl?.hostname.toLowerCase().replace(/^www\./, "") || "";
      const neutralPayload = {
        targetOrigin: safety.parsedUrl?.origin || input.targetUrl,
        targetUrl: input.targetUrl,
        canonicalUrl: extracted.identity.canonicalUrl,
        domain,
        scopeKey: cacheKey,
        configHash: JSON.stringify(input.config || {}),
        extractedAt: (/* @__PURE__ */ new Date()).toISOString(),
        extracted,
        crawlStats
      };
      this.observationCache.set(cacheKey, neutralPayload, cacheTtl);
    }
    return this.emitEvidence(extracted, input, crawlStats);
  }
  /**
   * Cancels any in-flight crawl requests.
   */
  cancel() {
    this.isCancelled = true;
    this.activeAbortController?.abort();
  }
  /**
   * Disposes engine resources.
   */
  dispose() {
    this.cancel();
    this.activeAbortController = null;
  }
};

// src/extension/contactIntelligence/emailIntelligence.ts
var ROLE_PREFIXES = /* @__PURE__ */ new Set([
  "sales",
  "support",
  "admin",
  "administrator",
  "billing",
  "accounts",
  "accounting",
  "jobs",
  "career",
  "careers",
  "marketing",
  "hr",
  "humanresources",
  "media",
  "press",
  "legal",
  "security",
  "compliance",
  "finance",
  "dev",
  "engineering",
  "operations",
  "ops"
]);
var GENERIC_PREFIXES = /* @__PURE__ */ new Set([
  "info",
  "hello",
  "hi",
  "contact",
  "contactus",
  "office",
  "mail",
  "help",
  "inquiry",
  "inquiries",
  "enquiry",
  "enquiries",
  "team",
  "general",
  "service",
  "services",
  "reception",
  "frontdesk",
  "desk"
]);
var FORBIDDEN_EXTENSIONS = /* @__PURE__ */ new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".css",
  ".js",
  ".pdf",
  ".zip"
]);
function processEmailIntelligence(rawEmail, sourceUrlOrDomain, domainOrContext, maybeContext) {
  if (!rawEmail || typeof rawEmail !== "string") {
    return null;
  }
  if (/[\x00-\x1F\x7F]/.test(rawEmail)) {
    return null;
  }
  let targetDomain = domainOrContext;
  let sourceUrl = "";
  let context = maybeContext || "VISIBLE_TEXT";
  if (sourceUrlOrDomain) {
    if (sourceUrlOrDomain.startsWith("http://") || sourceUrlOrDomain.startsWith("https://")) {
      sourceUrl = sourceUrlOrDomain;
      if (!targetDomain) {
        try {
          targetDomain = new URL(sourceUrlOrDomain).hostname;
        } catch {
        }
      }
    } else {
      targetDomain = sourceUrlOrDomain;
      if (domainOrContext) {
        context = domainOrContext;
      }
    }
  }
  const isMailto = /^mailto:/i.test(rawEmail);
  let trimmed = rawEmail.normalize("NFC").replace(/^mailto:/i, "").split("?")[0].trim();
  if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  if (!trimmed || trimmed.length > 254) {
    return null;
  }
  const lower = trimmed.toLowerCase();
  for (const ext of FORBIDDEN_EXTENSIONS) {
    if (lower.endsWith(ext)) {
      return null;
    }
  }
  if (/[<>{}]|script|javascript/i.test(trimmed)) {
    return null;
  }
  let inQuotes = false;
  let escaped = false;
  let separatorIndex = -1;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      if (inQuotes) {
        escaped = true;
      } else {
        return null;
      }
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "@" && !inQuotes) {
      separatorIndex = i;
      break;
    }
  }
  if (inQuotes || escaped || separatorIndex <= 0 || separatorIndex >= trimmed.length - 1) {
    return null;
  }
  const localPart = trimmed.slice(0, separatorIndex);
  const rawDomainPart = trimmed.slice(separatorIndex + 1);
  if (!localPart || localPart.length > 64) {
    return null;
  }
  if (localPart.startsWith('"')) {
    if (!localPart.endsWith('"') || localPart.length < 2) {
      return null;
    }
    let innerEscaped = false;
    const inner = localPart.slice(1, -1);
    for (let i = 0; i < inner.length; i++) {
      const c = inner[i];
      if (innerEscaped) {
        innerEscaped = false;
      } else if (c === "\\") {
        innerEscaped = true;
      } else if (c === '"') {
        return null;
      } else if (/[\x00-\x1F\x7F]/.test(c)) {
        return null;
      }
    }
    if (innerEscaped) {
      return null;
    }
  } else {
    if (/\s/.test(localPart)) {
      return null;
    }
    if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..") || localPart.includes("@")) {
      return null;
    }
    if (!/^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(localPart)) {
      return null;
    }
  }
  if (!rawDomainPart || rawDomainPart.length > 255) {
    return null;
  }
  if (rawDomainPart.includes("@") || /\s|[\x00-\x1F\x7F]/.test(rawDomainPart)) {
    return null;
  }
  if (rawDomainPart.startsWith(".") || rawDomainPart.endsWith(".") || rawDomainPart.includes("..")) {
    return null;
  }
  const labels = rawDomainPart.split(".");
  if (labels.length < 2) {
    return null;
  }
  for (const label of labels) {
    if (!label || label.length > 63) {
      return null;
    }
    if (label.startsWith("-") || label.endsWith("-")) {
      return null;
    }
    if (!/^[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?$/u.test(label)) {
      return null;
    }
  }
  const tld = labels[labels.length - 1];
  if (tld.length < 2 || /^[0-9]+$/.test(tld)) {
    return null;
  }
  const domainPart = rawDomainPart.toLowerCase();
  const normalizedEmail = `${localPart}@${domainPart}`;
  const cleanLocal = localPart.toLowerCase().replace(/[^a-z0-9]/g, "");
  let classification = "UNKNOWN";
  if (ROLE_PREFIXES.has(cleanLocal) || GENERIC_PREFIXES.has(cleanLocal)) {
    classification = "ROLE_ACCOUNT";
  } else if (/^[a-z]+[._-][a-z]+$/i.test(localPart) || // e.g. john.doe, jane_smith
  /^[a-z]{1,2}[a-z]+$/i.test(localPart)) {
    classification = "PERSON_NAMED";
  } else {
    classification = "UNKNOWN";
  }
  let domainRelationship = "UNKNOWN";
  if (targetDomain) {
    const cleanWebDomain = targetDomain.toLowerCase().replace(/^www\./, "").trim();
    if (cleanWebDomain) {
      if (domainPart === cleanWebDomain) {
        domainRelationship = "EXACT_DOMAIN_MATCH";
      } else if (domainPart.endsWith(`.${cleanWebDomain}`)) {
        domainRelationship = "SUBDOMAIN_MATCH";
      } else {
        domainRelationship = "EXTERNAL_DOMAIN";
      }
    }
  }
  let evidenceClassification = "PUBLICLY_LISTED";
  if (isMailto || context === "MAILTO") {
    evidenceClassification = "MAILTO";
  } else if (sourceUrl.includes("#jsonld") || sourceUrl.includes("schema") || context === "STRUCTURED_DATA") {
    evidenceClassification = "STRUCTURED_DATA";
  } else if (context === "PERSON_ASSOCIATED") {
    evidenceClassification = "PERSON_ASSOCIATED";
  } else if (domainRelationship === "EXACT_DOMAIN_MATCH") {
    evidenceClassification = "DOMAIN_MATCHED";
  }
  const confidenceState = domainRelationship === "EXACT_DOMAIN_MATCH" || evidenceClassification === "STRUCTURED_DATA" ? "HIGH" : "MEDIUM";
  return {
    isValid: true,
    rawValue: rawEmail,
    normalizedEmail,
    localPart,
    domainPart,
    classification,
    domainRelationship,
    evidenceClassification,
    confidenceState,
    provenance: "LEADNORIA_DERIVED"
  };
}

// src/extension/contactIntelligence/phoneIntelligence.ts
var DEPARTMENT_LABEL_PATTERNS = [
  { pattern: /\b(?:sales|admissions)\b/i, label: "Sales" },
  { pattern: /\b(?:support|customer\s+service|helpdesk)\b/i, label: "Support" },
  { pattern: /\b(?:office|reception|front\s*desk|main)\b/i, label: "Main Office" },
  { pattern: /\b(?:direct|mobile|cell)\b/i, label: "Direct" },
  { pattern: /\b(?:emergency|after\s*hours)\b/i, label: "Emergency" },
  { pattern: /\b(?:billing|accounts)\b/i, label: "Billing" },
  { pattern: /\b(?:fax)\b/i, label: "Fax" }
];
function extractPhoneLabel(contextSnippet) {
  if (!contextSnippet) return void 0;
  for (const { pattern, label } of DEPARTMENT_LABEL_PATTERNS) {
    if (pattern.test(contextSnippet)) {
      return label;
    }
  }
  return void 0;
}
function processPhoneIntelligence(rawPhone, contextSnippet, observedSourceContextOrCountry, countryHint) {
  const isTel = (rawPhone || "").toLowerCase().startsWith("tel:");
  const trimmed = (rawPhone || "").replace(/^tel:/i, "").trim();
  if (!trimmed) {
    return {
      isValid: false,
      rawValue: rawPhone,
      normalizedValue: "",
      evidenceClassification: "INVALID",
      confidenceState: "INVALID",
      reason: "EMPTY_PHONE"
    };
  }
  if (/[<>{}]|script/i.test(trimmed)) {
    return {
      isValid: false,
      rawValue: rawPhone,
      normalizedValue: "",
      evidenceClassification: "INVALID",
      confidenceState: "INVALID",
      reason: "UNSAFE_PHONE_CHARACTERS"
    };
  }
  const digitsOnly = trimmed.replace(/[^0-9]/g, "");
  if (digitsOnly.length < 7) {
    return null;
  }
  const country = countryHint || (observedSourceContextOrCountry && observedSourceContextOrCountry.length === 2 && observedSourceContextOrCountry === observedSourceContextOrCountry.toUpperCase() ? observedSourceContextOrCountry : void 0);
  const norm = normalizeBusinessPhone(trimmed);
  let evidenceClassification = "PUBLICLY_LISTED";
  if (isTel || observedSourceContextOrCountry === "TEL_LINK") {
    evidenceClassification = "TEL_LINK";
  } else if (observedSourceContextOrCountry === "STRUCTURED_DATA" || contextSnippet && (contextSnippet.includes("#jsonld") || contextSnippet.includes("schema"))) {
    evidenceClassification = "STRUCTURED_DATA";
  }
  if (norm.status === "INVALID" || !norm.isValid) {
    if (norm.status === "AMBIGUOUS" && (norm.normalizedValue || digitsOnly.length === 10)) {
      const e1642 = (country === "US" || !norm.normalizedValue) && digitsOnly.length === 10 ? `+1${digitsOnly}` : norm.normalizedValue || digitsOnly;
      return {
        isValid: true,
        rawValue: rawPhone,
        normalizedValue: e1642,
        normalizedPhone: e1642,
        countryCodeKnown: Boolean(country || norm.countryCode),
        e164Format: e1642,
        nationalFormat: norm.nationalFormat,
        countryCode: country || norm.countryCode,
        label: extractPhoneLabel(contextSnippet),
        evidenceClassification,
        confidenceState: country ? "HIGH" : "MEDIUM"
      };
    }
    return null;
  }
  const e164 = norm.e164Format || (country === "US" && digitsOnly.length === 10 ? `+1${digitsOnly}` : norm.normalizedValue);
  return {
    isValid: true,
    rawValue: rawPhone,
    normalizedValue: e164,
    normalizedPhone: e164,
    countryCodeKnown: Boolean(norm.countryCode || country),
    e164Format: norm.e164Format || e164,
    nationalFormat: norm.nationalFormat,
    countryCode: norm.countryCode || country,
    dialCode: norm.dialCode,
    extension: norm.extension,
    label: extractPhoneLabel(contextSnippet),
    evidenceClassification,
    confidenceState: norm.e164Format || country ? "HIGH" : "MEDIUM"
  };
}

// src/extension/contactIntelligence/personIntelligence.ts
function stripHtml(input) {
  return (input || "").replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "").replace(/<[^>]*>/g, " ");
}
function normalizePersonName(rawName) {
  if (!rawName) return "";
  const stripped = stripHtml(rawName);
  const clean = stripped.normalize("NFC").replace(/[^\p{L}\p{N}\s.'-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 100);
  const cleanWithoutHonorific = clean.replace(/^(?:dr|mr|mrs|ms|prof)\.?\s+/i, "");
  const normalizedKey = cleanWithoutHonorific.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim().slice(0, 100);
  return normalizedKey;
}
function normalizeJobTitle(rawTitle) {
  if (!rawTitle) return "";
  const stripped = stripHtml(rawTitle);
  return stripped.normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase().slice(0, 100);
}
function clusterAndDeduplicatePeople(rawPeople, observedAt) {
  const canonicalPeople = [];
  for (const raw of rawPeople) {
    const normalizedName = normalizePersonName(raw.fullName);
    if (!normalizedName) continue;
    const displayName = stripHtml(raw.fullName).normalize("NFC").replace(/[^\p{L}\p{N}\s.'-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 100);
    const displayTitle = raw.jobTitle ? stripHtml(raw.jobTitle).normalize("NFC").replace(/\s+/g, " ").trim().slice(0, 100) : void 0;
    const normalizedJobTitle = raw.jobTitle ? normalizeJobTitle(raw.jobTitle) : void 0;
    const roleCategory = extractRoleClassification(raw.jobTitle);
    const normEmail = raw.email ? raw.email.toLowerCase().trim() : void 0;
    const normLinkedIn = raw.linkedInUrl ? raw.linkedInUrl.toLowerCase().trim() : void 0;
    let merged = false;
    for (const existing of canonicalPeople) {
      const emailMatch = normEmail && existing.emailRefs.some((e) => e.toLowerCase() === normEmail);
      const linkedInMatch = normLinkedIn && existing.socialRefs.some((s) => s.toLowerCase() === normLinkedIn);
      if (emailMatch || linkedInMatch) {
        if (!existing.sourcePages.includes(raw.sourceUrl)) {
          existing.sourcePages.push(raw.sourceUrl);
        }
        existing.evidence.push({
          sourceUrl: raw.sourceUrl,
          evidenceKind: raw.evidenceType,
          snippet: raw.jobTitle,
          observedAt: raw.observedAt || observedAt
        });
        existing.lastObservedAt = observedAt;
        existing.observationCount++;
        if (normEmail && !existing.emailRefs.includes(normEmail)) {
          existing.emailRefs.push(normEmail);
        }
        if (raw.phone && !existing.phoneRefs.includes(raw.phone)) {
          existing.phoneRefs.push(raw.phone);
        }
        if (normLinkedIn && !existing.socialRefs.includes(normLinkedIn)) {
          existing.socialRefs.push(normLinkedIn);
        }
        merged = true;
        break;
      }
      if (existing.normalizedName === normalizedName) {
        if (!existing.potentialDuplicatePersonIds) {
          existing.potentialDuplicatePersonIds = [];
        }
      }
    }
    if (!merged) {
      const personId = `per_${normalizedName}_${canonicalPeople.length + 1}`;
      const newPerson = {
        personId,
        fullName: displayName,
        normalizedName,
        jobTitle: displayTitle,
        normalizedJobTitle,
        roleCategory,
        emailRefs: normEmail ? [normEmail] : [],
        phoneRefs: raw.phone ? [raw.phone] : [],
        socialRefs: normLinkedIn ? [normLinkedIn] : [],
        sourcePages: [raw.sourceUrl],
        evidence: [
          {
            sourceUrl: raw.sourceUrl,
            evidenceKind: raw.evidenceType,
            snippet: raw.jobTitle,
            observedAt: raw.observedAt || observedAt
          }
        ],
        confidenceState: normEmail || normLinkedIn ? "HIGH" : "MEDIUM",
        potentialDuplicatePersonIds: [],
        provenance: "WEBSITE_DERIVED",
        sourceContributions: [],
        firstObservedAt: raw.observedAt || observedAt,
        lastObservedAt: raw.observedAt || observedAt,
        observationCount: 1
      };
      for (const existing of canonicalPeople) {
        if (existing.normalizedName === normalizedName) {
          if (!existing.potentialDuplicatePersonIds) existing.potentialDuplicatePersonIds = [];
          existing.potentialDuplicatePersonIds.push(personId);
          newPerson.potentialDuplicatePersonIds?.push(existing.personId);
        }
      }
      canonicalPeople.push(newPerson);
    }
  }
  return canonicalPeople;
}
function extractRoleClassification(rawTitle) {
  if (!rawTitle) return void 0;
  const clean = stripHtml(rawTitle).toLowerCase().trim();
  if (/\b(?:co-founder|founder)\b/i.test(clean)) return "FOUNDER";
  if (/\b(?:co-owner|owner)\b/i.test(clean)) return "OWNER";
  if (/\b(?:ceo|chief\s+executive\s+officer)\b/i.test(clean)) return "CEO";
  if (/\b(?:coo|chief\s+operating\s+officer)\b/i.test(clean)) return "COO";
  if (/\b(?:cfo|chief\s+financial\s+officer)\b/i.test(clean)) return "CFO";
  if (/\b(?:cto|chief\s+technology\s+officer)\b/i.test(clean)) return "CTO";
  if (/\b(?:cmo|chief\s+marketing\s+officer)\b/i.test(clean)) return "CMO";
  if (/\b(?:president)\b/i.test(clean)) return "PRESIDENT";
  if (/\b(?:vice\s+president|vp)\b/i.test(clean)) return "VICE_PRESIDENT";
  if (/\b(?:managing\s+director|executive\s+director|director)\b/i.test(clean)) return "DIRECTOR";
  if (/\b(?:managing\s+partner|partner)\b/i.test(clean)) return "PARTNER";
  if (/\b(?:principal)\b/i.test(clean)) return "PRINCIPAL";
  if (/\b(?:general\s+manager|manager)\b/i.test(clean)) return "MANAGER";
  if (/\b(?:dentist|orthodontist)\b/i.test(clean)) return "DENTIST";
  if (/\b(?:physician|surgeon|doctor)\b/i.test(clean)) return "PHYSICIAN";
  if (/\b(?:attorney|lawyer|counsel)\b/i.test(clean)) return "ATTORNEY";
  if (/\b(?:consultant)\b/i.test(clean)) return "CONSULTANT";
  return void 0;
}

// src/extension/contactIntelligence/associationEngine.ts
function associateContactsAndPeople(contacts, people, rawPeople) {
  const rawToCanonical = /* @__PURE__ */ new Map();
  for (const raw of rawPeople) {
    const matched = people.find(
      (p) => p.sourcePages.includes(raw.sourceUrl) && p.fullName.toLowerCase() === raw.fullName.toLowerCase()
    ) || people.find(
      (p) => p.fullName.toLowerCase() === raw.fullName.toLowerCase()
    );
    if (matched) {
      rawToCanonical.set(raw, matched);
    }
  }
  for (const contact of contacts) {
    for (const [raw, canonicalPerson] of rawToCanonical.entries()) {
      let isExplicit = false;
      if (contact.contactType === "EMAIL") {
        if (raw.email && contact.normalizedValue.toLowerCase() === raw.email.toLowerCase()) {
          isExplicit = true;
        }
      } else if (contact.contactType === "PHONE") {
        if (raw.phone && contact.normalizedValue.replace(/[^0-9]/g, "").includes(raw.phone.replace(/[^0-9]/g, ""))) {
          isExplicit = true;
        }
      } else if (contact.contactType === "SOCIAL_PROFILE") {
        if (raw.linkedInUrl && contact.normalizedValue.toLowerCase() === raw.linkedInUrl.toLowerCase()) {
          isExplicit = true;
        }
      }
      if (isExplicit) {
        if (!contact.associatedPersonIds) contact.associatedPersonIds = [];
        if (!canonicalPerson.emailRefs) canonicalPerson.emailRefs = [];
        if (!canonicalPerson.phoneRefs) canonicalPerson.phoneRefs = [];
        if (!canonicalPerson.socialRefs) canonicalPerson.socialRefs = [];
        if (!contact.associatedPersonIds.includes(canonicalPerson.personId)) {
          contact.associatedPersonIds.push(canonicalPerson.personId);
          contact.associatedPersonId = canonicalPerson.personId;
          contact.associationStrength = "EXPLICIT_ASSOCIATION";
          contact.associationConfidence = "EXPLICIT_ASSOCIATION";
          if (contact.evidenceType === "PUBLICLY_LISTED") {
            contact.evidenceType = "PERSON_ASSOCIATED";
          }
        }
        if (contact.contactType === "EMAIL") {
          if (!canonicalPerson.emailRefs.includes(contact.normalizedValue)) {
            canonicalPerson.emailRefs.push(contact.normalizedValue);
          }
        } else if (contact.contactType === "PHONE") {
          if (!canonicalPerson.phoneRefs.includes(contact.normalizedValue)) {
            canonicalPerson.phoneRefs.push(contact.normalizedValue);
          }
        } else if (contact.contactType === "SOCIAL_PROFILE") {
          if (!canonicalPerson.socialRefs.includes(contact.normalizedValue)) {
            canonicalPerson.socialRefs.push(contact.normalizedValue);
          }
          contact.socialAssociationType = "PERSON_PROFILE";
          contact.socialProfile = { platform: contact.socialPlatform, associationType: "PERSON_PROFILE" };
        }
      }
    }
    if (contact.contactType === "SOCIAL_PROFILE") {
      if (!contact.socialAssociationType) {
        contact.socialAssociationType = "BUSINESS_PROFILE";
      }
      if (!contact.socialProfile) {
        contact.socialProfile = {
          platform: contact.socialPlatform,
          associationType: contact.socialAssociationType
        };
      }
    }
  }
  return { contacts, people };
}

// src/extension/contactIntelligence/completenessCalculator.ts
function calculateContactCompleteness(contacts, people) {
  const hasPublicEmail = contacts.some((c) => c.contactType === "EMAIL" && c.confidenceState !== "INVALID");
  const hasPublicPhone = contacts.some((c) => c.contactType === "PHONE" && c.confidenceState !== "INVALID");
  const hasContactForm = contacts.some((c) => c.contactType === "CONTACT_FORM");
  const hasSocialProfile = contacts.some((c) => c.contactType === "SOCIAL_PROFILE");
  const hasPublicPerson = people.length > 0;
  const hasPersonAssociatedEmail = people.some((p) => p.emailRefs.length > 0);
  const hasPersonAssociatedPhone = people.some((p) => p.phoneRefs.length > 0);
  const metrics = [
    hasPublicEmail,
    hasPublicPhone,
    hasContactForm,
    hasSocialProfile,
    hasPublicPerson,
    hasPersonAssociatedEmail,
    hasPersonAssociatedPhone
  ];
  const trueCount = metrics.filter(Boolean).length;
  const contactCompletenessRatio = trueCount / metrics.length;
  return {
    hasPublicEmail,
    hasPublicPhone,
    hasContactForm,
    hasSocialProfile,
    hasPublicPerson,
    hasPersonAssociatedEmail,
    hasPersonAssociatedPhone,
    contactCompletenessRatio
  };
}
function determineContactPrioritySignal(contacts, people, conflicts = []) {
  if (conflicts.some((c) => c.conflictType === "PHONE_CONFLICT" || c.conflictType === "EMAIL_CONFLICT")) {
    return "CONFLICTING_CONTACT";
  }
  const hasDirectPerson = people.some((p) => p.emailRefs.length > 0 || p.phoneRefs.length > 0);
  if (hasDirectPerson) {
    return "DIRECT_PUBLIC_CONTACT";
  }
  const hasRoleContact = contacts.some((c) => c.contactType === "EMAIL" && c.emailClassification === "ROLE_ACCOUNT");
  if (hasRoleContact) {
    return "ROLE_CONTACT";
  }
  const hasGenericEmailOrPhone = contacts.some(
    (c) => c.contactType === "EMAIL" && c.confidenceState !== "INVALID" || c.contactType === "PHONE" && c.confidenceState !== "INVALID"
  );
  if (hasGenericEmailOrPhone) {
    return "GENERIC_BUSINESS_CONTACT";
  }
  const hasForm = contacts.some((c) => c.contactType === "CONTACT_FORM");
  if (hasForm) {
    return "WEBSITE_FORM_ONLY";
  }
  const hasSocial = contacts.some((c) => c.contactType === "SOCIAL_PROFILE");
  if (hasSocial) {
    return "SOCIAL_ONLY";
  }
  return "NO_PUBLIC_CONTACT";
}

// src/extension/contactIntelligence/graphBuilder.ts
function buildContactSourceGraph(targetUrl, arg2, arg3, arg4) {
  let pagesVisited = [];
  let contacts = [];
  let people = [];
  if (Array.isArray(arg2) && arg2.length > 0 && typeof arg2[0] === "string") {
    pagesVisited = arg2;
    contacts = Array.isArray(arg3) ? arg3 : [];
    people = Array.isArray(arg4) ? arg4 : [];
  } else {
    contacts = Array.isArray(arg2) ? arg2 : [];
    people = Array.isArray(arg3) ? arg3 : [];
    const pagesSet = /* @__PURE__ */ new Set();
    if (targetUrl) pagesSet.add(targetUrl);
    for (const c of contacts) {
      if (c.sourcePages) c.sourcePages.forEach((p) => p && pagesSet.add(p));
      if (c.sourceUrl) pagesSet.add(c.sourceUrl);
    }
    for (const p of people) {
      if (p.sourcePages) p.sourcePages.forEach((pg) => pg && pagesSet.add(pg));
    }
    pagesVisited = Array.from(pagesSet);
  }
  const nodes = [];
  const edges = [];
  const addedNodeIds = /* @__PURE__ */ new Set();
  const websiteId = "node_root_website";
  nodes.push({
    id: websiteId,
    type: "WEBSITE",
    label: targetUrl,
    url: targetUrl
  });
  addedNodeIds.add(websiteId);
  for (const pageUrl of pagesVisited) {
    if (!pageUrl || typeof pageUrl !== "string") continue;
    const pageId = `node_page_${pageUrl.replace(/[^a-zA-Z0-9]/g, "_").slice(-32)}`;
    if (!addedNodeIds.has(pageId)) {
      nodes.push({
        id: pageId,
        type: "PAGE",
        label: pageUrl,
        url: pageUrl
      });
      addedNodeIds.add(pageId);
      edges.push({
        fromId: websiteId,
        toId: pageId,
        relationship: "HOSTS_PAGE"
      });
    }
  }
  const getPageNodeId = (pageUrl) => {
    const clean = (pageUrl || "").replace(/[^a-zA-Z0-9]/g, "_").slice(-32);
    return `node_page_${clean}`;
  };
  for (const contact of contacts) {
    const contactNodeId = `node_contact_${contact.contactId}`;
    if (!addedNodeIds.has(contactNodeId)) {
      nodes.push({
        id: contactNodeId,
        type: "CONTACT",
        label: `${contact.contactType}: ${contact.normalizedValue}`
      });
      addedNodeIds.add(contactNodeId);
      const pages = contact.sourcePages && contact.sourcePages.length > 0 ? contact.sourcePages : contact.sourceUrl ? [contact.sourceUrl] : [];
      for (const pageUrl of pages) {
        if (!pageUrl) continue;
        const pageNodeId = getPageNodeId(pageUrl);
        if (addedNodeIds.has(pageNodeId)) {
          edges.push({
            fromId: pageNodeId,
            toId: contactNodeId,
            relationship: "EXPOSES_CONTACT"
          });
        }
      }
    }
  }
  for (const person of people) {
    const personNodeId = `node_person_${person.personId}`;
    if (!addedNodeIds.has(personNodeId)) {
      nodes.push({
        id: personNodeId,
        type: "PERSON",
        label: `${person.fullName} (${person.jobTitle || "Team"})`
      });
      addedNodeIds.add(personNodeId);
      for (const pageUrl of person.sourcePages) {
        const pageNodeId = getPageNodeId(pageUrl);
        if (addedNodeIds.has(pageNodeId)) {
          edges.push({
            fromId: pageNodeId,
            toId: personNodeId,
            relationship: "EXPOSES_PERSON"
          });
        }
      }
      for (const emailRef of person.emailRefs) {
        const contactNodeId = `node_contact_${emailRef}`;
        if (addedNodeIds.has(contactNodeId)) {
          edges.push({
            fromId: personNodeId,
            toId: contactNodeId,
            relationship: "ASSOCIATED_WITH"
          });
        }
      }
      for (const phoneRef of person.phoneRefs) {
        const contactNodeId = `node_contact_${phoneRef}`;
        if (addedNodeIds.has(contactNodeId)) {
          edges.push({
            fromId: personNodeId,
            toId: contactNodeId,
            relationship: "ASSOCIATED_WITH"
          });
        }
      }
      for (const socialRef of person.socialRefs) {
        const contactNodeId = `node_contact_${socialRef}`;
        if (addedNodeIds.has(contactNodeId)) {
          edges.push({
            fromId: personNodeId,
            toId: contactNodeId,
            relationship: "ASSOCIATED_WITH"
          });
        }
      }
    }
  }
  return { nodes, edges };
}

// src/extension/contactIntelligence/changeDetector.ts
function detectContactChanges(arg1, arg2, arg3, arg4) {
  let currentContacts = [];
  let currentPeople = [];
  let previousSnapshot = void 0;
  let observedAt = typeof arg4 === "string" ? arg4 : (/* @__PURE__ */ new Date()).toISOString();
  if (Array.isArray(arg1)) {
    currentContacts = arg1;
    currentPeople = Array.isArray(arg2) ? arg2 : [];
    previousSnapshot = arg3;
  } else {
    previousSnapshot = arg1;
    currentContacts = Array.isArray(arg2) ? arg2 : [];
    currentPeople = Array.isArray(arg3) ? arg3 : [];
    if (typeof arg4 === "string") observedAt = arg4;
  }
  if (!previousSnapshot) return [];
  const changes = [];
  const prevContacts = previousSnapshot.canonicalContacts || previousSnapshot.contacts || [];
  const prevPeople = previousSnapshot.canonicalPeople || previousSnapshot.people || [];
  const currentEmails = currentContacts.filter((c) => c.contactType === "EMAIL");
  const prevEmails = prevContacts.filter((c) => c.contactType === "EMAIL");
  for (const ce of currentEmails) {
    if (!prevEmails.some((pe) => pe.normalizedValue === ce.normalizedValue)) {
      changes.push({
        type: "ADDED",
        target: "EMAIL",
        changeType: "EMAIL_ADDED",
        currentValue: ce.normalizedValue,
        observedAt
      });
    }
  }
  for (const pe of prevEmails) {
    if (!currentEmails.some((ce) => ce.normalizedValue === pe.normalizedValue)) {
      changes.push({
        type: "REMOVED",
        target: "EMAIL",
        changeType: "EMAIL_REMOVED",
        previousValue: pe.normalizedValue,
        observedAt
      });
    }
  }
  const currentPhones = currentContacts.filter((c) => c.contactType === "PHONE");
  const prevPhones = prevContacts.filter((c) => c.contactType === "PHONE");
  for (const cp of currentPhones) {
    if (!prevPhones.some((pp) => pp.normalizedValue === cp.normalizedValue)) {
      changes.push({
        type: "ADDED",
        target: "PHONE",
        changeType: "PHONE_ADDED",
        currentValue: cp.normalizedValue,
        observedAt
      });
    }
  }
  for (const pp of prevPhones) {
    if (!currentPhones.some((cp) => cp.normalizedValue === pp.normalizedValue)) {
      changes.push({
        type: "REMOVED",
        target: "PHONE",
        changeType: "PHONE_REMOVED",
        previousValue: pp.normalizedValue,
        observedAt
      });
    }
  }
  for (const cp of currentPeople) {
    const prevPerson = prevPeople.find((pp) => pp.normalizedName === cp.normalizedName);
    if (prevPerson) {
      if (prevPerson.jobTitle && cp.jobTitle && prevPerson.jobTitle !== cp.jobTitle) {
        changes.push({
          type: "MODIFIED",
          target: "TITLE",
          changeType: "TITLE_CHANGED",
          previousValue: prevPerson.jobTitle,
          currentValue: cp.jobTitle,
          observedAt
        });
      }
    } else {
      changes.push({
        type: "ADDED",
        target: "PERSON",
        changeType: "PERSON_ADDED",
        currentValue: cp.fullName,
        observedAt
      });
    }
  }
  return changes;
}

// src/extension/contactIntelligence/contactIntelligenceEngine.ts
var ContactIntelligenceEngine = class {
  /**
   * Sanitizes plain text from HTML or script injection payloads.
   */
  sanitizeText(raw) {
    return (raw || "").replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "").replace(/<[^>]*>/g, "").normalize("NFC").replace(/\s+/g, " ").trim();
  }
  /**
   * Main pipeline to process website intelligence into structured canonical contacts & people.
   */
  process(input) {
    const observedAt = (/* @__PURE__ */ new Date()).toISOString();
    const websiteResult = input.websiteResult;
    const isGoogleRestricted = input.sourceContext === "GOOGLE_MAPS" || input.sourceContext === "GOOGLE" || input.provenanceContext === "GOOGLE_DERIVED" || input.sourceRestrictions?.isRestricted === true || input.websiteResult?.isRestricted === true;
    const makeContribution = (fieldName) => {
      if (isGoogleRestricted) {
        return {
          source: "GOOGLE_MAPS",
          provenance: "GOOGLE_DERIVED",
          fieldName,
          acquisitionContext: "GOOGLE_CONSUMER_WEB",
          restrictionBasis: "GOOGLE_CONSUMER_WEB_RESTRICTED",
          isRestricted: true,
          policyStatus: "PRODUCT_REJECTED",
          persistenceStatus: "NOT_PERSISTABLE",
          exportStatus: "NOT_EXPORTABLE"
        };
      }
      let sourceVal = "FUTURE_SOURCE";
      if (input.sourceContext === "META" || input.sourceContext === "META_AD_LIBRARY") {
        sourceVal = "META_AD_LIBRARY";
      } else if (input.sourceContext === "USER_PROVIDED" || input.sourceContext === "USER_PROVIDED_DOMAIN") {
        sourceVal = "USER_PROVIDED_DOMAIN";
      }
      return {
        source: sourceVal,
        provenance: "WEBSITE_DERIVED",
        fieldName,
        acquisitionContext: "WEBSITE_DIRECT",
        restrictionBasis: "NONE",
        isRestricted: false,
        policyStatus: "POLICY_APPROVED",
        persistenceStatus: "PERSISTABLE",
        exportStatus: "EXPORTABLE"
      };
    };
    const targetDomain = websiteResult?.identity?.domain || "";
    const contacts = [];
    const rootTargetUrl = input.targetUrl || websiteResult?.identity?.canonicalUrl || "";
    const rawEmails = websiteResult?.emails || [];
    for (const raw of rawEmails) {
      const emailVal = raw.normalizedEmail || raw.rawEmail || raw.rawValue;
      const emailRes = processEmailIntelligence(emailVal, targetDomain);
      if (!emailRes.isValid) continue;
      const norm = emailRes.normalizedEmail;
      const existing = contacts.find((c) => c.contactType === "EMAIL" && c.normalizedValue === norm);
      const sourcePage = raw.sourceUrl || raw.evidence?.[0]?.pageUrl || rootTargetUrl;
      if (existing) {
        if (sourcePage && !existing.sourcePages.includes(sourcePage)) {
          existing.sourcePages.push(sourcePage);
          existing.evidenceType = "MULTI_PAGE_CORROBORATED";
        }
        existing.lastObservedAt = observedAt;
        existing.observationCount++;
      } else {
        const contactId = `ct_email_${norm.replace(/[^a-zA-Z0-9]/g, "_")}`;
        contacts.push({
          contactId,
          contactType: "EMAIL",
          rawValue: raw.rawValue || raw.rawEmail || norm,
          normalizedValue: norm,
          sourceUrl: sourcePage,
          sourcePages: sourcePage ? [sourcePage] : [],
          evidenceType: emailRes.evidenceClassification,
          confidenceState: emailRes.confidenceState,
          emailClassification: emailRes.classification,
          emailDomainRelationship: emailRes.domainRelationship,
          associatedPersonIds: [],
          provenance: "WEBSITE_DERIVED",
          sourceContributions: [makeContribution("email")],
          firstObservedAt: observedAt,
          lastObservedAt: observedAt,
          observationCount: 1
        });
      }
    }
    const rawPhones = websiteResult?.phones || [];
    for (const raw of rawPhones) {
      const phoneVal = raw.rawNumber || raw.rawValue || raw.normalizedNumber || raw.normalizedValue;
      const phoneRes = processPhoneIntelligence(phoneVal);
      if (!phoneRes.isValid) continue;
      const norm = phoneRes.normalizedValue;
      const existing = contacts.find((c) => c.contactType === "PHONE" && c.normalizedValue === norm);
      const sourcePage = raw.sourceUrl || raw.evidence?.[0]?.pageUrl || rootTargetUrl;
      if (existing) {
        if (sourcePage && !existing.sourcePages.includes(sourcePage)) {
          existing.sourcePages.push(sourcePage);
          existing.evidenceType = "MULTI_PAGE_CORROBORATED";
        }
        existing.lastObservedAt = observedAt;
        existing.observationCount++;
      } else {
        const contactId = `ct_phone_${norm.replace(/[^0-9]/g, "") || String(contacts.length + 1)}`;
        contacts.push({
          contactId,
          contactType: "PHONE",
          rawValue: raw.rawValue || raw.rawNumber || norm,
          normalizedValue: norm,
          label: phoneRes.label || raw.label,
          sourceUrl: sourcePage,
          sourcePages: sourcePage ? [sourcePage] : [],
          evidenceType: phoneRes.evidenceClassification,
          confidenceState: phoneRes.confidenceState,
          associatedPersonIds: [],
          provenance: "WEBSITE_DERIVED",
          sourceContributions: [makeContribution("phone")],
          firstObservedAt: observedAt,
          lastObservedAt: observedAt,
          observationCount: 1
        });
      }
    }
    const rawForms = websiteResult?.contactForms || [];
    for (const form of rawForms) {
      if (form.present === false) continue;
      const formUrl = form.pageUrl || form.actionUrl || form.sourceUrl || rootTargetUrl;
      if (!formUrl) continue;
      const contactId = `ct_form_${formUrl.replace(/[^a-zA-Z0-9]/g, "_").slice(-20)}`;
      if (!contacts.some((c) => c.contactType === "CONTACT_FORM" && c.normalizedValue === formUrl)) {
        contacts.push({
          contactId,
          contactType: "CONTACT_FORM",
          rawValue: formUrl,
          normalizedValue: formUrl,
          label: "Contact Form",
          sourceUrl: formUrl,
          sourcePages: [formUrl],
          evidenceType: "STRUCTURED_DATA",
          confidenceState: "HIGH",
          associatedPersonIds: [],
          provenance: "WEBSITE_DERIVED",
          sourceContributions: [makeContribution("contact_form")],
          firstObservedAt: observedAt,
          lastObservedAt: observedAt,
          observationCount: 1
        });
      }
    }
    const normalizeSocialUrl2 = (rawUrl) => {
      const trimmed = (rawUrl || "").trim();
      if (!/^https?:\/\//i.test(trimmed)) {
        return "";
      }
      try {
        const u = new URL(trimmed);
        if (u.protocol !== "http:" && u.protocol !== "https:") return "";
        const host = u.hostname.toLowerCase().replace(/^www\./, "");
        const pathname = u.pathname.replace(/\/+$/, "");
        return `https://${host}${pathname}`;
      } catch {
        return "";
      }
    };
    const rawSocial = websiteResult?.socialProfiles || [];
    for (const soc of rawSocial) {
      const rawUrl = soc.rawUrl || soc.url || "";
      const normUrl = normalizeSocialUrl2(rawUrl);
      if (!normUrl || /sharer\.php|intent\/tweet|sharearticle/i.test(normUrl)) {
        continue;
      }
      const existing = contacts.find((c) => c.contactType === "SOCIAL_PROFILE" && c.normalizedValue === normUrl);
      const sourcePage = soc.pageObserved || soc.sourceUrl || rootTargetUrl;
      if (existing) {
        if (sourcePage && !existing.sourcePages.includes(sourcePage)) {
          existing.sourcePages.push(sourcePage);
        }
        existing.lastObservedAt = observedAt;
        existing.observationCount++;
      } else {
        const contactId = `ct_social_${soc.platform.toLowerCase()}_${contacts.length + 1}`;
        contacts.push({
          contactId,
          contactType: "SOCIAL_PROFILE",
          rawValue: rawUrl,
          normalizedValue: normUrl,
          label: soc.platform,
          sourceUrl: sourcePage,
          sourcePages: sourcePage ? [sourcePage] : [],
          evidenceType: "PUBLICLY_LISTED",
          confidenceState: "HIGH",
          socialPlatform: soc.platform,
          socialAssociationType: "BUSINESS_PROFILE",
          socialProfile: { platform: soc.platform, associationType: "BUSINESS_PROFILE" },
          associatedPersonIds: [],
          provenance: "WEBSITE_DERIVED",
          sourceContributions: [makeContribution("social")],
          firstObservedAt: observedAt,
          lastObservedAt: observedAt,
          observationCount: 1
        });
      }
    }
    const rawPeople = websiteResult?.publicPeople || [];
    const canonicalPeople = clusterAndDeduplicatePeople(rawPeople, observedAt);
    for (const p of canonicalPeople) {
      p.sourceContributions = [makeContribution("person")];
      p.fullName = this.sanitizeText(p.fullName);
      if (p.jobTitle) p.jobTitle = this.sanitizeText(p.jobTitle);
      for (const rawLnk of p.socialRefs) {
        const normLnk = normalizeSocialUrl2(rawLnk);
        if (!contacts.some((c) => c.contactType === "SOCIAL_PROFILE" && c.normalizedValue === normLnk)) {
          const contactId = `ct_social_linkedin_${contacts.length + 1}`;
          contacts.push({
            contactId,
            contactType: "SOCIAL_PROFILE",
            rawValue: rawLnk,
            normalizedValue: normLnk,
            label: "LINKEDIN",
            sourceUrl: p.sourcePages[0] || rootTargetUrl,
            sourcePages: p.sourcePages.slice(),
            evidenceType: "PUBLICLY_LISTED",
            confidenceState: "HIGH",
            socialPlatform: "LINKEDIN",
            socialAssociationType: "PERSON_PROFILE",
            socialProfile: { platform: "LINKEDIN", associationType: "PERSON_PROFILE" },
            associatedPersonId: p.personId,
            associatedPersonIds: [p.personId],
            associationStrength: "EXPLICIT_ASSOCIATION",
            associationConfidence: "EXPLICIT_ASSOCIATION",
            provenance: "WEBSITE_DERIVED",
            sourceContributions: [makeContribution("social")],
            firstObservedAt: observedAt,
            lastObservedAt: observedAt,
            observationCount: 1
          });
        }
      }
    }
    associateContactsAndPeople(contacts, canonicalPeople, rawPeople);
    const prevContacts = input.previousSession?.canonicalContacts || input.previousSnapshot?.contacts || [];
    for (const contact of contacts) {
      const prev = prevContacts.find((p) => {
        if (p.contactType !== contact.contactType) return false;
        if (contact.contactType === "PHONE") {
          const d1 = p.normalizedValue.replace(/[^0-9]/g, "");
          const d2 = contact.normalizedValue.replace(/[^0-9]/g, "");
          return d1 === d2 || d1.length >= 10 && d2.length >= 10 && (d1.endsWith(d2) || d2.endsWith(d1));
        }
        return p.normalizedValue.toLowerCase() === contact.normalizedValue.toLowerCase();
      });
      if (prev) {
        contact.firstObservedAt = prev.firstObservedAt || prev.lastObservedAt;
        contact.lastObservedAt = observedAt;
        contact.observationCount = (prev.observationCount || 1) + 1;
      }
    }
    const conflicts = [];
    if (websiteResult?.conflicts) {
      for (const conf of websiteResult.conflicts) {
        conflicts.push({
          conflictType: conf.conflictType,
          values: conf.values.map((v) => ({
            value: v.value,
            sourceUrl: v.sourceUrl,
            observedAt: v.observedAt || observedAt
          })),
          corroborationCount: conf.values.length
        });
      }
    }
    const distinctEmails = contacts.filter((c) => c.contactType === "EMAIL");
    if (distinctEmails.length > 1 && !conflicts.some((c) => c.conflictType === "EMAIL_CONFLICT")) {
      conflicts.push({
        conflictType: "EMAIL_CONFLICT",
        values: distinctEmails.map((e) => ({
          value: e.normalizedValue,
          sourceUrl: e.sourceUrl || rootTargetUrl,
          observedAt
        })),
        corroborationCount: distinctEmails.length
      });
    }
    const distinctPhones = contacts.filter((c) => c.contactType === "PHONE");
    if (distinctPhones.length > 1 && !conflicts.some((c) => c.conflictType === "PHONE_CONFLICT")) {
      conflicts.push({
        conflictType: "PHONE_CONFLICT",
        values: distinctPhones.map((p) => ({
          value: p.normalizedValue,
          sourceUrl: p.sourceUrl || rootTargetUrl,
          observedAt
        })),
        corroborationCount: distinctPhones.length
      });
    }
    for (const p of canonicalPeople) {
      const distinctTitles = new Set(p.evidence.map((e) => e.snippet).filter(Boolean));
      if (distinctTitles.size > 1) {
        conflicts.push({
          conflictType: "TITLE_CONFLICT",
          values: Array.from(distinctTitles).map((t) => ({
            value: t,
            sourceUrl: p.sourcePages[0] || rootTargetUrl,
            observedAt
          })),
          corroborationCount: distinctTitles.size
        });
      }
    }
    const completeness = calculateContactCompleteness(contacts, canonicalPeople);
    const prioritySignal = determineContactPrioritySignal(contacts, canonicalPeople, conflicts);
    const pagesVisited = websiteResult?.sourcePages || [rootTargetUrl];
    const sourceGraph = buildContactSourceGraph(rootTargetUrl, pagesVisited, contacts, canonicalPeople);
    const prevSession = input.previousSession || input.previousSnapshot;
    const changes = detectContactChanges(prevSession, contacts, canonicalPeople);
    const resultContributions = [
      makeContribution("contact_intelligence")
    ];
    return {
      contacts,
      people: canonicalPeople,
      prioritySignal,
      completeness,
      sourceGraph,
      conflicts,
      changes,
      provenance: isGoogleRestricted ? "GOOGLE_DERIVED" : "LEADNORIA_DERIVED",
      sourceContributions: resultContributions,
      observedAt,
      isRestricted: isGoogleRestricted,
      persistenceEligibility: isGoogleRestricted ? "NOT_PERSISTABLE" : "PERSISTABLE",
      exportEligibility: isGoogleRestricted ? "NOT_EXPORTABLE" : "EXPORTABLE",
      restrictionBasis: isGoogleRestricted ? "GOOGLE_CONSUMER_WEB_RESTRICTED" : void 0
    };
  }
};

// src/extension/acquisition/engine/enrichmentQueue.ts
var GoogleMapsEnrichmentQueue = class {
  constructor(sessionId, policy = {}, callbacks = {}, customFetch) {
    // Queue state
    this._pendingQueue = [];
    this._jobMap = /* @__PURE__ */ new Map();
    // candidateId -> job
    this._completedResults = /* @__PURE__ */ new Map();
    // candidateId -> result
    this._domainDeduplication = /* @__PURE__ */ new Map();
    // normalizedDomain -> candidateId
    // Concurrency & lifecycle locks
    this._activeWorkers = 0;
    this._isPaused = false;
    this._isCancelled = false;
    // Counters
    this._totalEligible = 0;
    this._queuedCount = 0;
    this._completedCount = 0;
    this._partialCount = 0;
    this._failedCount = 0;
    this._blockedCount = 0;
    this._skippedCount = 0;
    this._deferredCount = 0;
    this._pagesAttempted = 0;
    this._pagesSucceeded = 0;
    this._pagesFailed = 0;
    this._emailsFound = 0;
    this._phonesFound = 0;
    this._socialLinksFound = 0;
    this._personsFound = 0;
    this._websiteConflicts = 0;
    this._contactConflicts = 0;
    this._sessionId = sessionId;
    this._policy = { ...DEFAULT_ENRICHMENT_POLICY, ...policy };
    this._callbacks = callbacks;
    this._customFetch = customFetch;
    this._websiteEngine = new WebsiteIntelligenceEngine();
    this._contactEngine = new ContactIntelligenceEngine();
  }
  get sessionId() {
    return this._sessionId;
  }
  get isPaused() {
    return this._isPaused;
  }
  get isCancelled() {
    return this._isCancelled;
  }
  setCustomFetch(fetcher) {
    this._customFetch = fetcher;
  }
  /**
   * Enqueues a candidate for website intelligence enrichment.
   * Runs asynchronously: returns immediate status without blocking Maps acquisition.
   */
  enqueue(candidate) {
    if (this._isCancelled) {
      return { status: "CANCELLED", reason: "Enrichment queue is cancelled", isQueued: false };
    }
    const candidateId = candidate.candidateId;
    const existingResult = this._completedResults.get(candidateId);
    if (existingResult) {
      return {
        status: existingResult.status,
        reason: "Candidate already enriched in this session (idempotent suppression)",
        isQueued: false
      };
    }
    if (this._jobMap.has(candidateId)) {
      return {
        status: "QUEUED",
        reason: "Candidate is already queued for enrichment",
        isQueued: false
      };
    }
    const eligibility = evaluateWebsiteEligibility(candidate);
    if (!eligibility.isEligible || !eligibility.targetUrl) {
      if (eligibility.status === "BLOCKED" || eligibility.status === "BLOCKED_WEBSITE_CONFLICT") {
        this._blockedCount++;
        if (eligibility.status === "BLOCKED_WEBSITE_CONFLICT") {
          this._websiteConflicts++;
        }
        this._recordDiagnostic({
          code: eligibility.diagnosticCode || "WEBSITE_TARGET_INVALID",
          severity: "P2",
          recoveryClass: "TERMINAL",
          message: `Candidate ${candidateId} enrichment blocked: ${eligibility.reason}`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else {
        this._skippedCount++;
      }
      const nonEligibleResult = {
        sessionCandidateId: candidateId,
        websiteTarget: eligibility.targetUrl || "",
        status: eligibility.status,
        pagesVisited: [],
        pagesDiscovered: 0,
        qualityIssues: [eligibility.reason],
        diagnostics: [],
        startedAt: (/* @__PURE__ */ new Date()).toISOString(),
        completedAt: (/* @__PURE__ */ new Date()).toISOString(),
        durationMs: 0,
        truncated: false,
        terminationReason: "NONE",
        crawlerVersion: ENRICHMENT_ADAPTER_VERSION,
        retryCount: 0,
        fromCache: false
      };
      this._completedResults.set(candidateId, nonEligibleResult);
      return {
        status: eligibility.status,
        reason: eligibility.reason,
        isQueued: false
      };
    }
    this._totalEligible++;
    if (this._pendingQueue.length >= this._policy.maxPendingEnrichmentJobs) {
      this._deferredCount++;
      this._recordDiagnostic({
        code: "ENRICHMENT_QUEUE_FULL",
        severity: "P2",
        recoveryClass: "RECOVERABLE",
        message: `Pending enrichment queue reached limit (${this._policy.maxPendingEnrichmentJobs}). Candidate ${candidateId} deferred.`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      const deferredResult = {
        sessionCandidateId: candidateId,
        websiteTarget: eligibility.targetUrl,
        status: "ENRICHMENT_DEFERRED",
        pagesVisited: [],
        pagesDiscovered: 0,
        qualityIssues: ["Pending enrichment queue reached capacity bound"],
        diagnostics: [],
        startedAt: (/* @__PURE__ */ new Date()).toISOString(),
        completedAt: (/* @__PURE__ */ new Date()).toISOString(),
        durationMs: 0,
        truncated: false,
        terminationReason: "NONE",
        crawlerVersion: ENRICHMENT_ADAPTER_VERSION,
        retryCount: 0,
        fromCache: false
      };
      this._completedResults.set(candidateId, deferredResult);
      return {
        status: "ENRICHMENT_DEFERRED",
        reason: "Pending enrichment queue reached capacity bound (backpressure)",
        isQueued: false
      };
    }
    const normDomain = eligibility.normalizedDomain || "";
    if (normDomain && this._domainDeduplication.has(normDomain)) {
      const priorCandidateId = this._domainDeduplication.get(normDomain);
      const priorResult = this._completedResults.get(priorCandidateId);
      if (priorResult) {
        const clonedResult = {
          ...priorResult,
          sessionCandidateId: candidateId,
          fromCache: true
        };
        this._completedResults.set(candidateId, clonedResult);
        this._completedCount++;
        const enriched = mergeEnrichmentIntoCandidate(candidate, clonedResult);
        if (this._callbacks.onCandidateEnriched) {
          this._callbacks.onCandidateEnriched(enriched, clonedResult);
        }
        return {
          status: priorResult.status,
          reason: `Reused existing enrichment result from domain ${normDomain}`,
          isQueued: false
        };
      }
    }
    if (normDomain) {
      this._domainDeduplication.set(normDomain, candidateId);
    }
    const job = {
      candidateId,
      targetUrl: eligibility.targetUrl,
      normalizedDomain: normDomain,
      candidate,
      attemptCount: 0,
      enqueuedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this._pendingQueue.push(job);
    this._jobMap.set(candidateId, job);
    this._queuedCount++;
    this._notifyProgress();
    this._drainQueueAsync();
    return {
      status: "QUEUED",
      reason: "Candidate queued for website intelligence enrichment",
      isQueued: true
    };
  }
  /**
   * Pauses claiming new enrichment jobs. Active task reaches safe boundary.
   */
  pause() {
    this._isPaused = true;
    this._notifyProgress();
  }
  /**
   * Resumes claiming queued enrichment jobs.
   */
  resume() {
    if (this._isCancelled) {
      throw new Error("Cannot resume cancelled enrichment queue");
    }
    if (!this._isPaused) return;
    this._isPaused = false;
    this._notifyProgress();
    this._drainQueueAsync();
  }
  /**
   * Cancels enrichment queue permanently.
   */
  cancel() {
    this._isCancelled = true;
    this._isPaused = false;
    this._websiteEngine.cancel();
    for (const job of this._pendingQueue) {
      const cancelledResult = {
        sessionCandidateId: job.candidateId,
        websiteTarget: job.targetUrl,
        status: "CANCELLED",
        pagesVisited: [],
        pagesDiscovered: 0,
        qualityIssues: ["Enrichment cancelled by user"],
        diagnostics: [],
        startedAt: job.enqueuedAt,
        completedAt: (/* @__PURE__ */ new Date()).toISOString(),
        durationMs: 0,
        truncated: false,
        terminationReason: "USER_CANCELLED",
        crawlerVersion: ENRICHMENT_ADAPTER_VERSION,
        retryCount: job.attemptCount,
        fromCache: false
      };
      this._completedResults.set(job.candidateId, cancelledResult);
    }
    this._pendingQueue.length = 0;
    this._jobMap.clear();
    this._notifyProgress();
  }
  /**
   * Cleans up all session-scoped queue and worker state.
   */
  cleanup() {
    this.cancel();
    this._completedResults.clear();
    this._domainDeduplication.clear();
    this._websiteEngine.clearCache();
  }
  /**
   * Returns current snapshot of the enrichment pipeline.
   */
  getSnapshot() {
    return {
      totalEligible: this._totalEligible,
      eligible: this._totalEligible,
      queued: this._pendingQueue.length,
      running: this._activeWorkers,
      completed: this._completedCount,
      partial: this._partialCount,
      failed: this._failedCount,
      blocked: this._blockedCount,
      skipped: this._skippedCount,
      deferred: this._deferredCount,
      currentCandidateId: this._currentCandidateId,
      pagesAttempted: this._pagesAttempted,
      pagesSucceeded: this._pagesSucceeded,
      pagesFailed: this._pagesFailed,
      emailsFound: this._emailsFound,
      phonesFound: this._phonesFound,
      socialLinksFound: this._socialLinksFound,
      personsFound: this._personsFound,
      websiteConflicts: this._websiteConflicts,
      contactConflicts: this._contactConflicts,
      isPaused: this._isPaused,
      isCancelled: this._isCancelled
    };
  }
  getResult(candidateId) {
    return this._completedResults.get(candidateId);
  }
  getAllResults() {
    return Array.from(this._completedResults.values());
  }
  // ==========================================================================
  // Internal Worker & Execution Loop
  // ==========================================================================
  _drainQueueAsync() {
    if (this._isPaused || this._isCancelled) return;
    if (this._activeWorkers >= this._policy.maxConcurrentTasks) return;
    if (this._pendingQueue.length === 0) return;
    Promise.resolve().then(async () => {
      if (this._isPaused || this._isCancelled) return;
      if (this._activeWorkers >= this._policy.maxConcurrentTasks) return;
      if (this._pendingQueue.length === 0) return;
      this._activeWorkers++;
      try {
        while (!this._isPaused && !this._isCancelled && this._pendingQueue.length > 0) {
          const job = this._pendingQueue.shift();
          if (!job) break;
          this._jobMap.delete(job.candidateId);
          this._currentCandidateId = job.candidateId;
          this._notifyProgress();
          await this._processJob(job);
        }
      } finally {
        this._activeWorkers--;
        this._currentCandidateId = void 0;
        this._notifyProgress();
      }
    });
  }
  async _processJob(job) {
    job.attemptCount++;
    const startTime = Date.now();
    const input = {
      targetUrl: job.targetUrl,
      sourceContext: "GOOGLE_MAPS",
      provenanceContext: "GOOGLE_DERIVED",
      sourceRestrictions: {
        isRestricted: true,
        restrictionBasis: "GOOGLE_CONSUMER_WEB_RESTRICTED",
        policyStatus: "POLICY_GATED",
        persistenceEligibility: "NOT_PERSISTABLE",
        exportEligibility: "NOT_EXPORTABLE"
      },
      businessContext: {
        expectedName: job.candidate.businessName?.parsedValue || job.candidate.businessName?.rawValue,
        expectedPhone: job.candidate.phone?.parsedValue || job.candidate.phone?.rawValue,
        expectedAddress: job.candidate.address?.parsedValue || job.candidate.address?.rawValue
      },
      config: {
        maxPages: this._policy.maxPagesPerDomain,
        pageTimeoutMs: this._policy.pageTimeoutMs,
        domainTimeoutMs: this._policy.domainTimeoutMs,
        maxDocumentBytes: this._policy.maxDocumentBytes,
        collectPeople: this._policy.collectPeople,
        collectServices: this._policy.collectServices,
        detectTechnology: this._policy.detectTechnology
      }
    };
    try {
      const websiteResult = await this._websiteEngine.process(input, this._customFetch);
      const visitedCount = websiteResult.crawlStats?.pagesVisited?.length || 0;
      this._pagesAttempted += visitedCount;
      this._pagesSucceeded += visitedCount;
      const contactInput = {
        targetUrl: job.targetUrl,
        websiteResult,
        sourceContext: "GOOGLE_MAPS",
        provenanceContext: "GOOGLE_DERIVED",
        sourceRestrictions: {
          isRestricted: true,
          restrictionBasis: "GOOGLE_CONSUMER_WEB_RESTRICTED",
          policyStatus: "POLICY_GATED",
          persistenceEligibility: "NOT_PERSISTABLE",
          exportEligibility: "NOT_EXPORTABLE"
        }
      };
      const contactResult = this._contactEngine.process(contactInput);
      const contactList = contactResult.contacts || [];
      const peopleList = contactResult.people || [];
      const emails = contactList.filter((c) => c.contactType === "EMAIL").map((c) => ({
        email: c.normalizedValue,
        rawEmail: c.rawValue,
        classification: c.emailClassification || "GENERIC_BUSINESS",
        sourceUrl: c.sourceUrl,
        observedAt: c.lastObservedAt
      }));
      const phones = contactList.filter((c) => c.contactType === "PHONE").map((c) => ({
        phone: c.normalizedValue,
        rawPhone: c.rawValue,
        sourceUrl: c.sourceUrl,
        observedAt: c.lastObservedAt
      }));
      const socialProfiles = contactList.filter((c) => c.contactType === "SOCIAL_PROFILE").map((c) => ({
        platform: String(c.socialPlatform || "UNKNOWN"),
        url: c.normalizedValue,
        sourceUrl: c.sourceUrl
      }));
      const people = peopleList.map((p) => ({
        fullName: p.fullName,
        jobTitle: p.jobTitle,
        email: p.emailRefs?.length ? p.emailRefs[0] : void 0,
        phone: p.phoneRefs?.length ? p.phoneRefs[0] : void 0,
        linkedInUrl: p.socialRefs?.length ? p.socialRefs[0] : void 0,
        sourceUrl: p.sourcePages?.[0] || job.targetUrl,
        evidenceType: "VISIBLE_CONTENT",
        observedAt: p.lastObservedAt
      }));
      this._emailsFound += emails.length;
      this._phonesFound += phones.length;
      this._socialLinksFound += socialProfiles.length;
      this._personsFound += people.length;
      if (contactResult.conflicts?.length) {
        this._contactConflicts += contactResult.conflicts.length;
      }
      let status = "COMPLETED";
      let termReason = "SUCCESS";
      if (visitedCount === 0) {
        if (job.attemptCount <= this._policy.maxRetries && !this._isCancelled) {
          this._pendingQueue.unshift(job);
          this._drainQueueAsync();
          return;
        }
        status = "FAILED";
        termReason = "ERROR";
        this._failedCount++;
      } else if (websiteResult.crawlStats?.pagesFailed && websiteResult.crawlStats.pagesFailed.length > 0) {
        status = "PARTIAL";
        termReason = "MAX_PAGES";
        this._partialCount++;
      } else {
        this._completedCount++;
      }
      const enrichmentResult = {
        sessionCandidateId: job.candidateId,
        websiteTarget: job.targetUrl,
        status,
        pagesVisited: websiteResult.crawlStats?.pagesVisited || [],
        pagesDiscovered: websiteResult.crawlStats?.pagesDiscovered || visitedCount,
        websiteEvidence: {
          targetUrl: job.targetUrl,
          canonicalUrl: websiteResult.identity.canonicalUrl || job.targetUrl,
          domain: websiteResult.identity.domain,
          pageTitle: websiteResult.identity.pageTitle,
          metaDescription: websiteResult.identity.metaDescription,
          description: websiteResult.description?.text,
          businessName: websiteResult.identity.businessName,
          businessHours: websiteResult.identity.businessHours,
          technologies: (websiteResult.technologySignals || []).map((t) => ({
            name: t.name,
            category: t.category,
            state: t.state
          })),
          services: websiteResult.identity.services || [],
          sourcePages: websiteResult.sourcePages || []
        },
        contactEvidence: {
          emails,
          phones,
          socialProfiles,
          address: websiteResult.address ? {
            address: websiteResult.address.normalizedAddress,
            sourceUrl: websiteResult.address.evidence?.[0]?.pageUrl || job.targetUrl
          } : websiteResult.identity?.address ? {
            address: websiteResult.identity.address,
            sourceUrl: job.targetUrl
          } : void 0,
          contactForms: (websiteResult.contactForms || []).map((f) => ({
            actionUrl: f.formAction,
            formType: f.formMethod || (f.hasEmailField ? "EMAIL" : void 0)
          }))
        },
        personEvidence: {
          people
        },
        qualityIssues: [],
        diagnostics: [],
        startedAt: job.enqueuedAt,
        completedAt: (/* @__PURE__ */ new Date()).toISOString(),
        durationMs: Date.now() - startTime,
        truncated: false,
        terminationReason: termReason,
        crawlerVersion: ENRICHMENT_ADAPTER_VERSION,
        retryCount: job.attemptCount - 1,
        fromCache: websiteResult.crawlStats?.fromCache || false
      };
      this._completedResults.set(job.candidateId, enrichmentResult);
      const enrichedCandidate = mergeEnrichmentIntoCandidate(job.candidate, enrichmentResult);
      if (this._callbacks.onCandidateEnriched) {
        this._callbacks.onCandidateEnriched(enrichedCandidate, enrichmentResult);
      }
    } catch (err) {
      const errMsg = err?.message || String(err);
      const isTransient = this._isTransientError(errMsg);
      const isSecurityBlock = errMsg.includes("SSRF") || errMsg.includes("Cross-origin") || errMsg.includes("redirect") || errMsg.includes("FORBIDDEN");
      if (isTransient && !isSecurityBlock && job.attemptCount <= this._policy.maxRetries && !this._isCancelled) {
        this._pendingQueue.unshift(job);
        this._recordDiagnostic({
          code: "ENRICHMENT_TIMEOUT",
          severity: "P2",
          recoveryClass: "RETRYABLE",
          message: `Candidate ${job.candidateId} crawl attempt ${job.attemptCount} failed: ${errMsg}. Retrying.`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else {
        const isBlocked = isSecurityBlock || errMsg.includes("Invalid target");
        const status = isBlocked ? "BLOCKED" : "FAILED";
        if (isBlocked) {
          this._blockedCount++;
        } else {
          this._failedCount++;
        }
        const failedResult = {
          sessionCandidateId: job.candidateId,
          websiteTarget: job.targetUrl,
          status,
          pagesVisited: [],
          pagesDiscovered: 0,
          qualityIssues: [errMsg],
          diagnostics: [],
          startedAt: job.enqueuedAt,
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          durationMs: Date.now() - startTime,
          truncated: false,
          terminationReason: isBlocked ? "SSRF_BLOCKED" : "ERROR",
          crawlerVersion: ENRICHMENT_ADAPTER_VERSION,
          retryCount: job.attemptCount - 1,
          fromCache: false
        };
        this._completedResults.set(job.candidateId, failedResult);
        this._recordDiagnostic({
          code: isBlocked ? "WEBSITE_SSRF_BLOCKED" : "ENRICHMENT_TIMEOUT",
          severity: "P2",
          recoveryClass: "TERMINAL",
          message: `Candidate ${job.candidateId} enrichment ${status.toLowerCase()}: ${errMsg}`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        const enrichedCandidate = mergeEnrichmentIntoCandidate(job.candidate, failedResult);
        if (this._callbacks.onCandidateEnriched) {
          this._callbacks.onCandidateEnriched(enrichedCandidate, failedResult);
        }
      }
    }
  }
  _isTransientError(msg) {
    const lower = msg.toLowerCase();
    return lower.includes("timeout") || lower.includes("aborted") || lower.includes("econnreset") || lower.includes("network");
  }
  _recordDiagnostic(diag) {
    if (this._callbacks.onDiagnostic) {
      this._callbacks.onDiagnostic(diag);
    }
  }
  _notifyProgress() {
    if (this._callbacks.onQueueProgress) {
      this._callbacks.onQueueProgress(this.getSnapshot());
    }
  }
};

// src/extension/acquisition/engine/bulkOrchestrator.ts
var GoogleMapsBulkOrchestrator = class {
  constructor(params) {
    this._deduplicator = new SessionCandidateDeduplicator();
    this._state = "PLAN_CREATED";
    this._terminationReason = "NONE";
    this._startedAt = "";
    this._lastUpdatedAt = "";
    this._unitSummaries = /* @__PURE__ */ new Map();
    this._diagnostics = [];
    // Concurrency & lifecycle locks
    this._isExecuting = false;
    this._isPaused = false;
    this._isCancelled = false;
    // Candidate observations tracking
    this._rawCandidateObservations = 0;
    this._duplicateObservationCount = 0;
    this._plan = params.plan;
    this._runId = params.runId || `brun_${hashStringDeterministic(params.plan.planFingerprint + Date.now().toString())}`;
    this._tabDriver = params.tabDriver || {
      async navigateTab() {
        return true;
      },
      async getTab(id) {
        return { tabId: id, url: "https://www.google.com/maps", status: "complete" };
      },
      async getTabInfo(id) {
        return { tabId: id, url: "https://www.google.com/maps", status: "complete" };
      },
      async probeTabState() {
        return { ready: true, pageKind: "SEARCH_RESULTS", confidence: 1, isValid: true };
      }
    };
    this._tabId = params.tabId || 1;
    this._callbacks = params.callbacks || {};
    const rawPol = params.policy || {};
    const maxRetries = rawPol.maxAttemptsPerUnit !== void 0 ? Math.max(0, rawPol.maxAttemptsPerUnit - 1) : rawPol.maxRetriesPerUnit !== void 0 ? rawPol.maxRetriesPerUnit : params.plan.executionPolicy.maxRetriesPerUnit;
    const retryDelay = rawPol.delayBetweenRetriesMs !== void 0 ? rawPol.delayBetweenRetriesMs : rawPol.retryBackoffMs !== void 0 ? rawPol.retryBackoffMs : params.plan.executionPolicy.retryBackoffMs;
    this._policy = {
      ...params.plan.executionPolicy,
      ...rawPol,
      maxRetriesPerUnit: maxRetries,
      retryBackoffMs: retryDelay
    };
    this._domProvider = params.domProvider || (() => typeof document !== "undefined" ? document : null);
    this._queue = new GoogleMapsAcquisitionQueue(params.plan.searchUnits);
    this._orchestrator = new GoogleMapsNavigationOrchestrator(this._tabDriver, {
      timeoutMs: this._policy.navigationTimeoutMs,
      pollIntervalMs: 50
    });
    this._checkpointManager = new GoogleMapsCheckpointManager(
      params.storageAdapter || new InMemoryCheckpointStorage()
    );
    this._filterManager = new GoogleMapsFilterStateManager([], params.plan.initialFilter);
    this._enrichmentQueue = new GoogleMapsEnrichmentQueue(
      this._runId,
      params.enrichmentPolicy || {},
      {
        onCandidateEnriched: (enrichedCandidate) => {
          this._deduplicator.updateCandidate(enrichedCandidate);
          this._filterManager.ingestCandidate(enrichedCandidate);
          this._notifyProgress();
        },
        onQueueProgress: () => {
          this._notifyProgress();
        },
        onDiagnostic: (diag) => {
          this._diagnostics.push(diag);
          if (this._callbacks.onDiagnostic) {
            this._callbacks.onDiagnostic(diag);
          }
        }
      },
      params.enrichmentCustomFetch
    );
    for (const unit of params.plan.searchUnits) {
      this._unitSummaries.set(unit.searchUnitId, {
        searchUnitId: unit.searchUnitId,
        keyword: unit.normalizedKeyword,
        location: unit.normalizedLocation,
        query: unit.normalizedQuery,
        status: "PENDING",
        attemptCount: 0,
        elapsedMs: 0,
        candidateCount: 0,
        duplicateCount: 0
      });
    }
    this._state = "QUEUED";
    this._lastUpdatedAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  // ==========================================================================
  // Public Lifecycle Controls (Start, Pause, Resume, Cancel)
  // ==========================================================================
  /**
   * Starts sequential execution of the bulk research plan.
   * Enforces single-worker concurrency guard.
   */
  async start() {
    if (this._isExecuting || this._state === "RUNNING") {
      return Object.assign(this.getSnapshot(), {
        success: false,
        error: `A bulk research run is already active (${this._runId})`
      });
    }
    if (this._isCancelled || this._state === "CANCELLED") {
      throw new Error(`Cannot start a cancelled bulk research run (${this._runId})`);
    }
    if (this._state === "COMPLETED" || this._state === "PARTIALLY_COMPLETED") {
      throw new Error(`Cannot start an already completed bulk research run (${this._runId})`);
    }
    this._state = "RUNNING";
    this._isPaused = false;
    this._isCancelled = false;
    this._startedAt = this._startedAt || (/* @__PURE__ */ new Date()).toISOString();
    this._lastUpdatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await this._saveCheckpoint();
    this._notifyProgress();
    this._executionPromise = this._runExecutionLoop().catch((err) => {
      this._recordError("FATAL_RUN_ERROR", `Execution loop crashed: ${err.message || String(err)}`);
    });
    await this._executionPromise;
    return this.getSnapshot();
  }
  /**
   * Pauses the active bulk research run.
   * Ongoing SearchUnit reaches a safe boundary; no further units are claimed.
   */
  async pause() {
    if (this._state === "PAUSED" || this._isPaused) {
      return this.getSnapshot();
    }
    if (this._isCancelled || this._state === "CANCELLED" || this._state === "COMPLETED" || this._state === "PARTIALLY_COMPLETED" || this._state === "FAILED") {
      return this.getSnapshot();
    }
    this._isPaused = true;
    this._state = "PAUSED";
    this._queue.pause();
    this._enrichmentQueue.pause();
    this._lastUpdatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (this._activeScrollEngine) {
      try {
        this._activeScrollEngine.requestPause();
      } catch {
      }
    }
    if (this._currentUnit) {
      this._pausedUnitId = this._currentUnit.searchUnitId;
      const summary = this._unitSummaries.get(this._currentUnit.searchUnitId);
      if (summary && (summary.status === "RUNNING" || summary.status === "CLAIMED")) {
        this._unitSummaries.set(this._currentUnit.searchUnitId, {
          ...summary,
          status: "PAUSED",
          terminationReason: "USER_PAUSED"
        });
      }
    }
    await this._saveCheckpoint();
    this._notifyProgress();
    return this.getSnapshot();
  }
  /**
   * Resumes a paused bulk research run.
   */
  async resume() {
    if (this._isCancelled || this._state === "CANCELLED") {
      return false;
    }
    if (this._state === "COMPLETED" || this._state === "PARTIALLY_COMPLETED" || this._state === "FAILED") {
      return false;
    }
    if (this._state !== "PAUSED" && !this._isPaused) {
      return this.getSnapshot();
    }
    this._isPaused = false;
    this._state = "RUNNING";
    this._queue.resume();
    this._enrichmentQueue.resume();
    this._lastUpdatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (this._pausedUnitId) {
      const summary = this._unitSummaries.get(this._pausedUnitId);
      if (summary && summary.status === "PAUSED") {
        this._unitSummaries.set(this._pausedUnitId, {
          ...summary,
          status: "RUNNING"
        });
      }
    }
    await this._saveCheckpoint();
    this._notifyProgress();
    if (!this._isExecuting) {
      this._executionPromise = this._runExecutionLoop().catch((err) => {
        this._recordError("FATAL_RUN_ERROR", `Execution loop crashed on resume: ${err.message || String(err)}`);
      });
      await this._executionPromise;
    }
    return this.getSnapshot();
  }
  /**
   * Idempotently cancels the bulk research run.
   * Ongoing SearchUnit halts; all pending units are marked CANCELLED.
   */
  async cancel(reason = "USER_CANCELLED") {
    if (this._state === "CANCELLED" && this._isCancelled) {
      return this.getSnapshot();
    }
    this._isCancelled = true;
    this._isPaused = false;
    this._state = "CANCELLED";
    this._terminationReason = "USER_CANCELLED";
    this._queue.cancel();
    this._enrichmentQueue.cancel();
    this._lastUpdatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this._completedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (this._activeScrollEngine) {
      try {
        this._activeScrollEngine.requestCancel();
      } catch {
      }
    }
    if (this._currentUnit) {
      const summary = this._unitSummaries.get(this._currentUnit.searchUnitId);
      if (summary && summary.status !== "COMPLETED" && summary.status !== "FAILED") {
        this._unitSummaries.set(this._currentUnit.searchUnitId, {
          ...summary,
          status: "CANCELLED",
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          terminationReason: "USER_CANCELLED"
        });
      }
    }
    for (const [id, summary] of this._unitSummaries.entries()) {
      if (summary.status === "PENDING" || summary.status === "CLAIMED" || summary.status === "PAUSED") {
        this._unitSummaries.set(id, {
          ...summary,
          status: "CANCELLED",
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          terminationReason: "USER_CANCELLED"
        });
      }
    }
    await this._saveCheckpoint();
    this._notifyProgress();
    return this.getSnapshot();
  }
  // ==========================================================================
  // Filter Integration (Post-Acquisition / View Layer)
  // ==========================================================================
  getFilterManager() {
    return this._filterManager;
  }
  // ==========================================================================
  // Snapshots & Metrics
  // ==========================================================================
  getMetrics() {
    let completedUnits = 0;
    let failedUnits = 0;
    let cancelledUnits = 0;
    let runningUnits = 0;
    let queuedUnits = 0;
    let blockedUnits = 0;
    let retryingUnits = 0;
    for (const summary of this._unitSummaries.values()) {
      if (summary.attemptCount > 1 || summary.status === "RETRY_PENDING") {
        retryingUnits++;
      }
      switch (summary.status) {
        case "COMPLETED":
          completedUnits++;
          break;
        case "FAILED":
          failedUnits++;
          break;
        case "CANCELLED":
          cancelledUnits++;
          break;
        case "RUNNING":
          runningUnits++;
          break;
        case "CLAIMED":
        case "PENDING":
        case "PAUSED":
        case "RETRY_PENDING":
          queuedUnits++;
          break;
        case "BLOCKED":
          blockedUnits++;
          break;
      }
    }
    const filteredView = this._filterManager.getFilteredView();
    const enrichmentSnap = this._enrichmentQueue.getSnapshot();
    return {
      totalSearchUnits: this._plan.totalUnits,
      queuedUnits,
      runningUnits,
      completedUnits,
      failedUnits,
      retryingUnits,
      cancelledUnits,
      blockedUnits,
      rawCandidateObservations: this._rawCandidateObservations,
      uniqueCandidateCount: this._deduplicator.size,
      duplicateObservationCount: this._duplicateObservationCount,
      currentFilteredMatchCount: filteredView.matchingCount,
      eligibleForEnrichment: enrichmentSnap.totalEligible,
      enrichmentQueued: enrichmentSnap.queued,
      enrichmentRunning: enrichmentSnap.running,
      enrichmentCompleted: enrichmentSnap.completed,
      enrichmentPartial: enrichmentSnap.partial,
      enrichmentFailed: enrichmentSnap.failed,
      enrichmentBlocked: enrichmentSnap.blocked,
      enrichmentSkipped: enrichmentSnap.skipped,
      enrichmentDeferred: enrichmentSnap.deferred,
      emailsFound: enrichmentSnap.emailsFound || void 0,
      phonesFound: enrichmentSnap.phonesFound || void 0,
      personsFound: enrichmentSnap.personsFound || void 0
    };
  }
  verifyRunInvariants() {
    const metrics = this.getMetrics();
    const terminalCount = metrics.completedUnits + metrics.failedUnits + metrics.cancelledUnits;
    const nonTerminalCount = Array.from(this._unitSummaries.values()).filter((s) => s.status === "PENDING" || s.status === "CLAIMED" || s.status === "RUNNING" || s.status === "PAUSED" || s.status === "RETRY_PENDING" || s.status === "BLOCKED").length;
    const sum = terminalCount + nonTerminalCount;
    const valid = sum === metrics.totalSearchUnits && metrics.completedUnits <= metrics.totalSearchUnits && metrics.failedUnits <= metrics.totalSearchUnits && metrics.cancelledUnits <= metrics.totalSearchUnits;
    return {
      valid,
      sum,
      total: metrics.totalSearchUnits,
      details: {
        completed: metrics.completedUnits,
        failed: metrics.failedUnits,
        cancelled: metrics.cancelledUnits,
        queued: metrics.queuedUnits,
        running: metrics.runningUnits,
        retrying: metrics.retryingUnits,
        blocked: metrics.blockedUnits
      }
    };
  }
  setFilter(criteria) {
    if (criteria.ratingFilter !== void 0) {
      this._filterManager.setRatingFilter(criteria.ratingFilter);
    } else if (criteria.rating !== void 0) {
      this._filterManager.setRatingFilter(criteria.rating);
    }
    if (criteria.websiteFilter !== void 0) {
      this._filterManager.setWebsiteFilter(criteria.websiteFilter);
    } else if (criteria.website !== void 0) {
      this._filterManager.setWebsiteFilter(criteria.website);
    }
    this._notifyProgress();
  }
  ingestCandidate(cand) {
    this._rawCandidateObservations++;
    const dedupeResult = this._deduplicator.register(cand);
    if (!dedupeResult.isNew) {
      this._duplicateObservationCount++;
    }
    this._filterManager.ingestCandidate(dedupeResult.candidate);
    if (dedupeResult.candidate && "websiteUrl" in dedupeResult.candidate) {
      this._enrichmentQueue.enqueue(dedupeResult.candidate);
    }
    this._notifyProgress();
  }
  getEnrichmentQueue() {
    return this._enrichmentQueue;
  }
  getEnrichmentSnapshot() {
    return this._enrichmentQueue.getSnapshot();
  }
  setEnrichmentCustomFetch(fetcher) {
    this._enrichmentQueue.setCustomFetch(fetcher);
  }
  getSessionDataset() {
    return this._filterManager.getRawDataset();
  }
  getQualitySnapshot() {
    return this._deduplicator.getQualitySnapshot();
  }
  getPotentialDuplicates() {
    return this._deduplicator.getPotentialDuplicates();
  }
  getIdentityConflicts() {
    return this._deduplicator.getIdentityConflicts();
  }
  get deduplicator() {
    return this._deduplicator;
  }
  get queue() {
    return this._queue;
  }
  get enrichmentQueue() {
    return this._enrichmentQueue;
  }
  resetSearchUnitState() {
    if (this._activeScrollEngine) {
      this._activeScrollEngine = void 0;
    }
  }
  isCancelled() {
    return this._isCancelled;
  }
  createCheckpoint() {
    const metrics = this.getMetrics();
    const summariesArray = Array.from(this._unitSummaries.values());
    return {
      checkpointId: `bcp_${hashStringDeterministic(this._runId + this._lastUpdatedAt)}`,
      runId: this._runId,
      planId: this._plan.planId,
      planFingerprint: this._plan.planFingerprint,
      schemaVersion: BULK_PLAN_SCHEMA_VERSION,
      engineVersion: ENGINE_ADAPTER_VERSION,
      timestamp: this._lastUpdatedAt,
      state: this._state,
      terminationReason: this._terminationReason,
      currentSearchUnitId: this._currentUnit?.searchUnitId || this._pausedUnitId,
      currentQueueIndex: metrics.completedUnits + metrics.failedUnits,
      tabId: this._tabId,
      activeFilter: this._filterManager.getActiveFilter(),
      metrics,
      unitSummaries: summariesArray,
      startedAt: this._startedAt,
      lastUpdatedAt: this._lastUpdatedAt,
      diagnosticsSummary: {
        warningCount: this._diagnostics.filter((d) => d.severity === "P2").length,
        errorCount: this._diagnostics.filter((d) => d.severity === "P0" || d.severity === "P1").length,
        lastErrorCode: this._diagnostics[this._diagnostics.length - 1]?.code
      }
    };
  }
  restoreFromCheckpoint(cp) {
    if (!cp || typeof cp !== "object") return false;
    if (cp.schemaVersion !== BULK_PLAN_SCHEMA_VERSION) {
      this._recordDiagnostic({
        code: "INCOMPATIBLE_ADAPTER_VERSION",
        severity: "P1",
        recoveryClass: "TERMINAL",
        message: `Incompatible checkpoint schema version: ${cp.schemaVersion}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      return false;
    }
    if (cp.planFingerprint !== this._plan.planFingerprint) {
      this._recordDiagnostic({
        code: "STALE_METADATA",
        severity: "P1",
        recoveryClass: "TERMINAL",
        message: `Checkpoint plan fingerprint mismatch: ${cp.planFingerprint} !== ${this._plan.planFingerprint}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      return false;
    }
    this._runId = cp.runId || this._runId;
    this._state = cp.state;
    this._terminationReason = cp.terminationReason;
    if (cp.activeFilter) {
      this._filterManager.setFilter(cp.activeFilter);
    }
    return true;
  }
  async _executeLoop() {
    return this._runExecutionLoop();
  }
  getSnapshot() {
    const metrics = this.getMetrics();
    const progressPercent = metrics.totalSearchUnits > 0 ? Math.round((metrics.completedUnits + metrics.failedUnits + metrics.cancelledUnits) / metrics.totalSearchUnits * 100) : 0;
    const activeUnitObj = this._currentUnit || (this._pausedUnitId ? this._plan.searchUnits.find((u) => u.searchUnitId === this._pausedUnitId) : void 0);
    const currentUnitSummary = activeUnitObj ? this._unitSummaries.get(activeUnitObj.searchUnitId) : void 0;
    let currentUnitInfo = void 0;
    if (activeUnitObj && currentUnitSummary) {
      const allUnits = this._plan.searchUnits;
      const unitIndex = allUnits.findIndex((u) => u.searchUnitId === activeUnitObj.searchUnitId) + 1;
      currentUnitInfo = {
        searchUnitId: activeUnitObj.searchUnitId,
        keyword: activeUnitObj.normalizedKeyword,
        location: activeUnitObj.normalizedLocation,
        query: activeUnitObj.normalizedQuery,
        unitIndex: unitIndex > 0 ? unitIndex : 1,
        totalUnits: this._plan.totalUnits,
        status: currentUnitSummary.status,
        attemptCount: currentUnitSummary.attemptCount
      };
    }
    return {
      runId: this._runId,
      planId: this._plan.planId,
      state: this._state,
      terminationReason: this._terminationReason,
      currentSearchUnit: currentUnitInfo,
      currentUnit: currentUnitInfo,
      totalUnits: this._plan.totalUnits,
      completedUnits: metrics.completedUnits,
      failedUnits: metrics.failedUnits,
      cancelledUnits: metrics.cancelledUnits,
      pendingUnits: metrics.queuedUnits,
      progress: {
        unitsCompleted: metrics.completedUnits,
        totalUnits: this._plan.totalUnits,
        percent: progressPercent
      },
      progressPercent,
      metrics,
      activeFilter: this._filterManager.getActiveFilter(),
      filterSnapshot: {
        ...this._filterManager.getActiveFilter(),
        ratingFilter: this._filterManager.getActiveFilter().rating,
        websiteFilter: this._filterManager.getActiveFilter().website
      },
      isPausable: this._state === "RUNNING",
      isResumable: this._state === "PAUSED",
      isCancellable: this._state === "RUNNING" || this._state === "PAUSED" || this._state === "QUEUED",
      startedAt: this._startedAt,
      lastUpdatedAt: this._lastUpdatedAt,
      completedAt: this._completedAt,
      diagnostics: [...this._diagnostics],
      enrichmentSnapshot: this._enrichmentQueue.getSnapshot()
    };
  }
  // ==========================================================================
  // Core Sequential Execution Loop
  // ==========================================================================
  async _runExecutionLoop() {
    if (this._isExecuting) {
      return;
    }
    this._isExecuting = true;
    try {
      while (!this._isPaused && !this._isCancelled) {
        const elapsedRunMs = Date.now() - new Date(this._startedAt).getTime();
        if (elapsedRunMs > this._policy.maxRunDurationMs) {
          this._terminationReason = "TIME_LIMIT_REACHED";
          this._recordDiagnostic({
            code: "OBSERVATION_TIMEOUT",
            severity: "P1",
            recoveryClass: "TERMINAL",
            message: `Bulk run duration exceeded limit of ${this._policy.maxRunDurationMs}ms`,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
          break;
        }
        if (this._plan.maxResults !== void 0 && this._filterManager.getFilteredView().matchingCount >= this._plan.maxResults) {
          this._terminationReason = "PLAN_LIMIT_REACHED";
          break;
        }
        let unit = null;
        if (this._pausedUnitId) {
          unit = this._plan.searchUnits.find((u) => u.searchUnitId === this._pausedUnitId) || null;
          this._pausedUnitId = void 0;
        }
        if (!unit) {
          unit = this._queue.claimNext();
        }
        if (!unit) {
          break;
        }
        this._currentUnit = unit;
        await this._executeSingleSearchUnit(unit);
        this._currentUnit = void 0;
      }
    } finally {
      this._isExecuting = false;
      this._evaluateRunCompletion();
    }
  }
  /**
   * Executes a single claimed SearchUnit in the dedicated browser tab.
   */
  async _executeSingleSearchUnit(unit) {
    const summary = this._unitSummaries.get(unit.searchUnitId) || {
      searchUnitId: unit.searchUnitId,
      keyword: unit.normalizedKeyword,
      location: unit.normalizedLocation,
      query: unit.normalizedQuery,
      status: "PENDING",
      attemptCount: 0,
      elapsedMs: 0,
      candidateCount: 0,
      duplicateCount: 0
    };
    summary.attemptCount++;
    summary.status = "RUNNING";
    summary.startedAt = summary.startedAt || (/* @__PURE__ */ new Date()).toISOString();
    this._currentUnitSummary = summary;
    this._unitSummaries.set(unit.searchUnitId, summary);
    const allUnits = this._plan.searchUnits;
    const unitIndex = allUnits.findIndex((u) => u.searchUnitId === unit.searchUnitId) + 1;
    const onStart = this._callbacks.onSearchUnitStarted || this._callbacks.onUnitStarted;
    if (onStart) {
      onStart(unit, unitIndex, this._plan.totalUnits);
    }
    this._notifyProgress();
    if (this._isCancelled || this._state === "CANCELLED") {
      return;
    }
    if (this._isPaused || this._state === "PAUSED") {
      summary.status = "PAUSED";
      summary.terminationReason = "USER_PAUSED";
      this._pausedUnitId = unit.searchUnitId;
      this._unitSummaries.set(unit.searchUnitId, summary);
      return;
    }
    const startTime = Date.now();
    try {
      const tabOwnership = await this._orchestrator.validateTabOwnership(this._tabId, this._runId);
      if (!tabOwnership.valid) {
        throw new Error(tabOwnership.diagnostic?.message || "Dedicated acquisition tab ownership lost");
      }
      if (this._isPaused || this._state === "PAUSED") {
        summary.status = "PAUSED";
        summary.terminationReason = "USER_PAUSED";
        this._pausedUnitId = unit.searchUnitId;
        this._unitSummaries.set(unit.searchUnitId, summary);
        return;
      }
      const navResult = await this._orchestrator.navigateToSearchUnit(
        this._tabId,
        unit,
        this._runId
      );
      if (!navResult.success) {
        throw new Error(navResult.error || "Navigation to Google Maps search failed");
      }
      if (this._isPaused || this._state === "PAUSED") {
        summary.status = "PAUSED";
        summary.terminationReason = "USER_PAUSED";
        this._pausedUnitId = unit.searchUnitId;
        this._unitSummaries.set(unit.searchUnitId, summary);
        return;
      }
      const scrollResult = await this._executeFeedScrolling(unit);
      if (this._isCancelled) {
        return;
      }
      if (this._isPaused || this._state === "PAUSED" || scrollResult.terminationReason === "USER_PAUSED") {
        summary.status = "PAUSED";
        summary.terminationReason = "USER_PAUSED";
        summary.elapsedMs += Date.now() - startTime;
        summary.candidateCount = scrollResult.candidatesCount;
        this._pausedUnitId = unit.searchUnitId;
        this._unitSummaries.set(unit.searchUnitId, summary);
        return;
      }
      summary.status = "COMPLETED";
      summary.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      summary.elapsedMs += Date.now() - startTime;
      summary.candidateCount = scrollResult.candidatesCount;
      summary.terminationReason = scrollResult.terminationReason || "EXHAUSTED";
      this._queue.complete(unit.searchUnitId, scrollResult.candidatesCount);
      this._unitSummaries.set(unit.searchUnitId, summary);
      const onComp = this._callbacks.onSearchUnitCompleted || this._callbacks.onUnitCompleted;
      if (onComp) {
        onComp(unit, summary);
      }
    } catch (err) {
      if (this._isCancelled) {
        return;
      }
      summary.elapsedMs += Date.now() - startTime;
      const isTransient = this._isTransientError(err.message || String(err));
      const maxAttempts = this._policy.maxAttemptsPerUnit || this._policy.maxRetriesPerUnit + 1;
      if (isTransient && summary.attemptCount < maxAttempts && !this._isCancelled) {
        summary.status = "RETRY_PENDING";
        summary.lastError = err.message || String(err);
        this._unitSummaries.set(unit.searchUnitId, summary);
        this._recordDiagnostic({
          code: "NAVIGATION_TIMEOUT",
          severity: "P2",
          recoveryClass: "RETRYABLE",
          message: `SearchUnit ${unit.normalizedQuery} failed attempt ${summary.attemptCount}. Scheduling retry. Error: ${err.message}`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          searchUnitId: unit.searchUnitId
        });
        this._queue.fail(unit.searchUnitId, err.message || String(err));
        if (this._policy.retryBackoffMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, this._policy.retryBackoffMs * summary.attemptCount));
        }
      } else {
        summary.status = "FAILED";
        summary.completedAt = (/* @__PURE__ */ new Date()).toISOString();
        summary.lastError = err.message || String(err);
        summary.terminationReason = summary.attemptCount >= maxAttempts ? "RETRY_EXHAUSTED" : "ERROR";
        this._unitSummaries.set(unit.searchUnitId, summary);
        this._queue.fail(unit.searchUnitId, err.message || String(err));
        const onFailed = this._callbacks.onSearchUnitFailed || this._callbacks.onUnitFailed;
        if (onFailed) {
          onFailed(unit, summary);
        }
        this._recordDiagnostic({
          code: "CANDIDATE_OBSERVATION_FAILED",
          severity: "P1",
          recoveryClass: "RECOVERABLE",
          message: `SearchUnit ${unit.normalizedQuery} failed terminally: ${err.message}`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          searchUnitId: unit.searchUnitId
        });
      }
    } finally {
      this._cleanupUnitResources();
      await this._saveCheckpoint();
      this._notifyProgress();
    }
  }
  /**
   * Executes feed scroll engine on the active tab and collects candidate observations.
   */
  async _executeFeedScrolling(unit) {
    return new Promise((resolve, reject) => {
      let unitObservedCount = 0;
      const engine = new GoogleMapsFeedScrollEngine(
        this._domProvider,
        {
          sessionId: this._runId,
          searchUnitId: unit.searchUnitId,
          searchKeyword: unit.normalizedKeyword,
          searchLocation: unit.normalizedLocation,
          pageUrl: unit.navigationUrl
        },
        {
          maxCandidates: this._policy.maxCandidatesPerUnit,
          maxScrollSteps: this._policy.maxScrollStepsPerUnit,
          maxDurationMs: this._policy.maxDurationPerUnitMs
        },
        {
          onNewCandidates: (newCandidates) => {
            unitObservedCount += newCandidates.length;
            this._rawCandidateObservations += newCandidates.length;
            this._filterManager.ingestCandidates(newCandidates);
            for (const cand of newCandidates) {
              if (cand && "websiteUrl" in cand) {
                this._enrichmentQueue.enqueue(cand);
              }
            }
            if (this._callbacks.onCandidateBatch) {
              this._callbacks.onCandidateBatch(newCandidates);
            }
            this._notifyProgress();
            if (this._plan.maxResults !== void 0 && this._filterManager.getFilteredView().matchingCount >= this._plan.maxResults) {
              if (this._activeScrollEngine) {
                this._activeScrollEngine.requestCancel();
              }
            }
          },
          onBatchCompleted: () => {
          },
          isPaused: () => this._isPaused,
          isCancelled: () => this._isCancelled,
          onDiagnostic: (diag) => {
            this._diagnostics.push(diag);
            if (this._callbacks.onDiagnostic) {
              this._callbacks.onDiagnostic(diag);
            }
          }
        },
        this._deduplicator
      );
      this._activeScrollEngine = engine;
      engine.startScrollLoop().then((result) => {
        this._activeScrollEngine = void 0;
        resolve({
          candidatesCount: unitObservedCount,
          terminationReason: result.terminationReason || "EXHAUSTED"
        });
      }).catch((err) => {
        this._activeScrollEngine = void 0;
        reject(err);
      });
    });
  }
  /**
   * Cleans up unit-local state (disconnects observers, clears timers).
   * Preserves session-level deduplication and filter manager.
   */
  _cleanupUnitResources() {
    if (this._activeScrollEngine) {
      try {
        this._activeScrollEngine.cleanup();
      } catch {
      }
      this._activeScrollEngine = void 0;
    }
  }
  _isTransientError(msg) {
    const lower = msg.toLowerCase();
    if (lower.includes("closed") || lower.includes("tab not found") || lower.includes("ownership lost") || lower.includes("inaccessible")) {
      return false;
    }
    return lower.includes("timeout") || lower.includes("stalled") || lower.includes("loading") || lower.includes("temporary") || lower.includes("surface not found");
  }
  _evaluateRunCompletion() {
    if (this._isCancelled || this._state === "CANCELLED") {
      return;
    }
    if (this._isPaused || this._state === "PAUSED") {
      return;
    }
    const q = this._queue.getProgress();
    if (q.queued === 0 && q.inProgress === 0) {
      this._completedAt = (/* @__PURE__ */ new Date()).toISOString();
      if (q.failed > 0 && q.completed === 0) {
        this._state = "FAILED";
        this._terminationReason = "PARTIAL_FAILURE";
      } else if (q.failed > 0) {
        this._state = "PARTIALLY_COMPLETED";
        this._terminationReason = "PARTIAL_FAILURE";
      } else if (q.cancelled > 0 && q.completed === 0) {
        this._state = "CANCELLED";
        this._terminationReason = "USER_CANCELLED";
      } else {
        this._state = "COMPLETED";
        this._terminationReason = "ALL_UNITS_COMPLETED";
      }
      this._lastUpdatedAt = (/* @__PURE__ */ new Date()).toISOString();
      this._saveCheckpoint().catch(() => {
      });
      const snapshot = this.getSnapshot();
      if (this._callbacks.onRunCompleted) {
        this._callbacks.onRunCompleted(snapshot);
      }
      this._notifyProgress();
    }
  }
  // ==========================================================================
  // Checkpoints & Metadata Persistence (Firewall Compliant)
  // ==========================================================================
  async _saveCheckpoint() {
    const metrics = this.getMetrics();
    const qProgress = this._queue.getProgress();
    const summariesArray = Array.from(this._unitSummaries.values());
    const checkpoint = {
      checkpointId: `bcp_${hashStringDeterministic(this._runId + this._lastUpdatedAt)}`,
      runId: this._runId,
      planId: this._plan.planId,
      planFingerprint: this._plan.planFingerprint,
      schemaVersion: BULK_PLAN_SCHEMA_VERSION,
      engineVersion: ENGINE_ADAPTER_VERSION,
      timestamp: this._lastUpdatedAt,
      state: this._state,
      terminationReason: this._terminationReason,
      currentSearchUnitId: this._currentUnit?.searchUnitId,
      currentQueueIndex: metrics.completedUnits + metrics.failedUnits,
      tabId: this._tabId,
      activeFilter: this._filterManager.getActiveFilter(),
      metrics,
      unitSummaries: summariesArray,
      startedAt: this._startedAt,
      lastUpdatedAt: this._lastUpdatedAt,
      diagnosticsSummary: {
        warningCount: this._diagnostics.filter((d) => d.severity === "P2").length,
        errorCount: this._diagnostics.filter((d) => d.severity === "P0" || d.severity === "P1").length,
        lastErrorCode: this._diagnostics[this._diagnostics.length - 1]?.code
      }
    };
    if (this._currentUnit) {
      await this._checkpointManager.createCheckpoint({
        sessionId: this._runId,
        searchUnit: this._currentUnit,
        state: this._state === "PAUSED" ? "PAUSED" : "OBSERVING",
        pageUrl: this._currentUnit.navigationUrl,
        progress: {
          totalUnits: this._plan.totalUnits,
          completedUnits: metrics.completedUnits,
          pendingUnits: metrics.queuedUnits
        }
      });
    }
  }
  _recordDiagnostic(diag) {
    this._diagnostics.push(diag);
    if (this._callbacks.onDiagnostic) {
      this._callbacks.onDiagnostic(diag);
    }
  }
  _recordError(reason, msg) {
    this._state = "FAILED";
    this._terminationReason = reason;
    this._completedAt = (/* @__PURE__ */ new Date()).toISOString();
    this._recordDiagnostic({
      code: "INVALID_STATE_TRANSITION",
      severity: "P0",
      recoveryClass: "TERMINAL",
      message: msg,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    this._notifyProgress();
  }
  _notifyProgress() {
    if (this._callbacks.onProgress) {
      this._callbacks.onProgress(this.getSnapshot());
    }
  }
};

// src/extension/acquisition/engine/runtimeCoordinator.ts
function createDefaultTabDriver() {
  return {
    async getTab(tabId) {
      if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.get) {
        try {
          const tab = await chrome.tabs.get(tabId);
          return {
            id: tab.id ?? tabId,
            url: tab.url ?? "",
            active: tab.active ?? false,
            status: tab.status === "loading" ? "loading" : tab.status === "complete" ? "complete" : void 0
          };
        } catch {
          return null;
        }
      }
      return null;
    },
    async navigateTab(tabId, url) {
      if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.update) {
        try {
          await chrome.tabs.update(tabId, { url });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    },
    async probeTabState(tabId) {
      if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.get) {
        try {
          const tab = await chrome.tabs.get(tabId);
          return detectGoogleMapsPage(tab.url ?? "");
        } catch {
        }
      }
      return detectGoogleMapsPage("");
    }
  };
}
var GoogleMapsRuntimeCoordinator = class {
  constructor(defaultDriver = createDefaultTabDriver()) {
    this._sessions = /* @__PURE__ */ new Map();
    this._bulkOrchestrators = /* @__PURE__ */ new Map();
    this._defaultDriver = defaultDriver;
  }
  /**
   * Dispatches incoming Chrome extension runtime messages to the acquisition engine.
   */
  async handleAcquisitionMessage(rawMessage, _sender, customDriver) {
    const validation = validateAcquisitionMessage(rawMessage);
    if (!validation.valid || !validation.message) {
      return {
        success: false,
        error: validation.error || "Invalid acquisition message"
      };
    }
    const msg = validation.message;
    const sessionId = msg.payload.sessionId;
    switch (msg.type) {
      case "START_GMAPS_ACQUISITION": {
        return this.startAcquisition(
          sessionId,
          msg.payload.searchUnits,
          msg.payload.config,
          customDriver
        );
      }
      case "PAUSE_GMAPS_ACQUISITION": {
        return this.pauseAcquisition(sessionId);
      }
      case "RESUME_GMAPS_ACQUISITION": {
        return this.resumeAcquisition(sessionId);
      }
      case "CANCEL_GMAPS_ACQUISITION": {
        return this.cancelAcquisition(sessionId, msg.payload.reason);
      }
      case "GET_GMAPS_ACQUISITION_STATUS": {
        return this.getAcquisitionStatus(sessionId);
      }
      case "EXECUTE_GMAPS_FEED_SCROLL": {
        return this.executeFeedScroll(sessionId, msg.payload?.policy);
      }
      case "PROBE_GMAPS_LIVE_CAPABILITY": {
        return this.probeLiveCapability(void 0, msg.payload?.url);
      }
      case "SET_GMAPS_FILTER": {
        const p = msg.payload;
        return this.setSessionFilter(sessionId, {
          rating: normalizeRatingFilter2(p?.rating),
          website: normalizeWebsiteFilter2(p?.website)
        });
      }
      case "RESET_GMAPS_FILTER": {
        return this.resetSessionFilter(sessionId);
      }
      case "GET_GMAPS_FILTERED_VIEW": {
        return this.getSessionFilteredView(sessionId);
      }
      case "START_GMAPS_BULK_RESEARCH": {
        const p = msg.payload;
        return this.startBulkResearch({
          keywords: p.keywords,
          locations: p.locations,
          ratingFilter: p.ratingFilter,
          websiteFilter: p.websiteFilter,
          maxResults: p.maxResults,
          executionPolicy: p.executionPolicy,
          tabId: p.tabId,
          planId: p.planId,
          runId: p.runId || sessionId
        }, customDriver);
      }
      case "PAUSE_GMAPS_BULK_RESEARCH": {
        return this.pauseBulkResearch(sessionId);
      }
      case "RESUME_GMAPS_BULK_RESEARCH": {
        return this.resumeBulkResearch(sessionId);
      }
      case "CANCEL_GMAPS_BULK_RESEARCH": {
        return this.cancelBulkResearch(sessionId, msg.payload?.reason);
      }
      case "GET_GMAPS_BULK_RESEARCH_STATUS": {
        return this.getBulkResearchStatus(sessionId);
      }
      default:
        return {
          success: false,
          error: `Unhandled acquisition message type: ${msg.type}`
        };
    }
  }
  /**
   * Starts a Google Maps acquisition session from units input.
   */
  async startAcquisition(sessionId, inputs, configOverrides, driver) {
    if (!sessionId) {
      return { success: false, error: "sessionId is required" };
    }
    if (!inputs || inputs.length === 0) {
      return { success: false, error: "At least one searchUnit is required" };
    }
    const tabDriver = driver || this._defaultDriver;
    const config = {
      ...DEFAULT_MAPS_SESSION_CONFIG,
      ...configOverrides,
      sessionId
    };
    const stateMachine = new GoogleMapsStateMachine(sessionId);
    stateMachine.transitionTo("STARTING", "Starting Google Maps acquisition session");
    const queue = new GoogleMapsAcquisitionQueue();
    const plannedUnits = inputs.map((inp) => createSearchUnit(inp));
    queue.enqueue(plannedUnits);
    const checkpointManager = new GoogleMapsCheckpointManager(new InMemoryCheckpointStorage());
    const orchestrator = new GoogleMapsNavigationOrchestrator(tabDriver, {
      timeoutMs: config.navigationTimeoutMs,
      pollIntervalMs: 250
    });
    const ctx = {
      sessionId,
      stateMachine,
      queue,
      orchestrator,
      checkpointManager,
      config,
      tabDriver,
      candidatesObserved: [],
      diagnostics: [],
      deduplicator: new SessionCandidateDeduplicator(),
      batches: [],
      filterManager: new GoogleMapsFilterStateManager()
    };
    this._sessions.set(sessionId, ctx);
    const claimedUnit = queue.claimNext();
    if (!claimedUnit) {
      stateMachine.transitionTo("FAILED", "Queue had no runnable search units");
      return {
        success: false,
        sessionId,
        state: stateMachine.state,
        error: "No search units could be claimed"
      };
    }
    ctx.currentSearchUnit = claimedUnit;
    stateMachine.setSearchUnitId(claimedUnit.searchUnitId);
    const tabOwnership = await orchestrator.validateTabOwnership(config.tabId, sessionId);
    if (!tabOwnership.valid && tabOwnership.diagnostic) {
      ctx.diagnostics.push(tabOwnership.diagnostic);
      stateMachine.transitionTo("FAILED", tabOwnership.diagnostic.message);
      return {
        success: false,
        sessionId,
        state: stateMachine.state,
        error: tabOwnership.diagnostic.message,
        diagnostics: ctx.diagnostics
      };
    }
    stateMachine.transitionTo("NAVIGATING", `Navigating to query: ${claimedUnit.normalizedQuery}`);
    const navResult = await orchestrator.navigateToSearchUnit(
      config.tabId,
      claimedUnit,
      sessionId
    );
    if (!navResult.success) {
      if (navResult.diagnostics) {
        ctx.diagnostics.push(...navResult.diagnostics);
      }
      stateMachine.transitionTo("FAILED", navResult.error || "Navigation failed");
      queue.fail(claimedUnit.searchUnitId, navResult.error || "Navigation failed");
      return {
        success: false,
        sessionId,
        state: stateMachine.state,
        error: navResult.error || "Navigation failed",
        diagnostics: ctx.diagnostics
      };
    }
    stateMachine.transitionTo("OBSERVING", "Page ready; observing rendered results");
    const qProgress = queue.getProgress();
    const checkpoint = await checkpointManager.createCheckpoint({
      sessionId,
      searchUnit: claimedUnit,
      state: stateMachine.state,
      pageUrl: navResult.url,
      searchUnitProgressContext: {
        unitIndex: 1,
        totalUnits: qProgress.total,
        query: claimedUnit.normalizedQuery
      },
      progress: {
        totalUnits: qProgress.total,
        completedUnits: qProgress.completed,
        pendingUnits: qProgress.queued
      }
    });
    return {
      success: true,
      sessionId,
      state: stateMachine.state,
      progress: this._buildSessionProgress(ctx),
      candidatesCount: ctx.candidatesObserved.length,
      diagnostics: ctx.diagnostics,
      checkpointId: checkpoint.checkpointId,
      details: {
        searchUnitId: claimedUnit.searchUnitId,
        query: claimedUnit.normalizedQuery,
        navigationUrl: claimedUnit.navigationUrl
      }
    };
  }
  /**
   * Pauses an active acquisition session, preserving checkpoint and current progress.
   */
  async pauseAcquisition(sessionId) {
    const ctx = this._sessions.get(sessionId);
    if (!ctx) {
      return { success: false, error: `Session "${sessionId}" not found` };
    }
    ctx.queue.pause();
    ctx.stateMachine.pause("Operator requested pause");
    let checkpointId;
    if (ctx.currentSearchUnit) {
      const qProgress = ctx.queue.getProgress();
      const cp = await ctx.checkpointManager.createCheckpoint({
        sessionId,
        searchUnit: ctx.currentSearchUnit,
        state: ctx.stateMachine.state,
        pageUrl: ctx.currentSearchUnit.navigationUrl,
        lastObservedCandidateIdentity: ctx.candidatesObserved[ctx.candidatesObserved.length - 1]?.observationId,
        progress: {
          totalUnits: qProgress.total,
          completedUnits: qProgress.completed,
          pendingUnits: qProgress.queued
        }
      });
      checkpointId = cp.checkpointId;
    }
    return {
      success: true,
      sessionId,
      state: ctx.stateMachine.state,
      progress: this._buildSessionProgress(ctx),
      checkpointId,
      diagnostics: ctx.diagnostics
    };
  }
  /**
   * Resumes a paused acquisition session safely using preserved checkpoint state.
   */
  async resumeAcquisition(sessionId) {
    const ctx = this._sessions.get(sessionId);
    if (!ctx) {
      return { success: false, error: `Session "${sessionId}" not found` };
    }
    if (ctx.stateMachine.state === "CANCELLED" || ctx.queue.getProgress().isCancelled) {
      return { success: false, error: "Cannot resume a cancelled session" };
    }
    if (ctx.stateMachine.state !== "PAUSED") {
      return { success: false, error: `Cannot resume: session is in '${ctx.stateMachine.state}', expected 'PAUSED'` };
    }
    const latestCp = await ctx.checkpointManager.loadCheckpoint(sessionId);
    const validation = ctx.checkpointManager.validateCheckpoint(latestCp);
    if (!validation.valid) {
      return { success: false, error: `Cannot resume: ${validation.reason}` };
    }
    ctx.queue.resume();
    ctx.stateMachine.resume();
    return {
      success: true,
      sessionId,
      state: ctx.stateMachine.state,
      progress: this._buildSessionProgress(ctx),
      diagnostics: ctx.diagnostics
    };
  }
  /**
   * Cancels an active session, marking all remaining units cancelled.
   */
  async cancelAcquisition(sessionId, reason = "Operator cancelled session") {
    const ctx = this._sessions.get(sessionId);
    if (!ctx) {
      return { success: false, error: `Session "${sessionId}" not found` };
    }
    ctx.queue.cancel();
    ctx.stateMachine.cancel(reason);
    if (ctx.currentSearchUnit) {
      const qProgress = ctx.queue.getProgress();
      await ctx.checkpointManager.createCheckpoint({
        sessionId,
        searchUnit: ctx.currentSearchUnit,
        state: "CANCELLED",
        pageUrl: ctx.currentSearchUnit.navigationUrl,
        progress: {
          totalUnits: qProgress.total,
          completedUnits: qProgress.completed,
          pendingUnits: 0
        }
      });
    }
    return {
      success: true,
      sessionId,
      state: ctx.stateMachine.state,
      progress: this._buildSessionProgress(ctx),
      diagnostics: ctx.diagnostics
    };
  }
  /**
   * Gets current status of an acquisition session.
   */
  getAcquisitionStatus(sessionId) {
    const ctx = this._sessions.get(sessionId);
    if (!ctx) {
      return { success: false, error: `Session "${sessionId}" not found` };
    }
    return {
      success: true,
      sessionId,
      state: ctx.stateMachine.state,
      progress: this._buildSessionProgress(ctx),
      candidatesCount: ctx.candidatesObserved.length,
      diagnostics: ctx.diagnostics,
      details: {
        currentSearchUnitId: ctx.currentSearchUnit?.searchUnitId,
        pausedFromState: ctx.stateMachine.pausedFromState
      }
    };
  }
  /**
   * Ingests observed raw candidates from content-script observation boundary into session context.
   */
  ingestCandidateObservations(sessionId, rawCandidates, pageUrl) {
    const ctx = this._sessions.get(sessionId);
    if (!ctx || !ctx.currentSearchUnit) {
      return { count: 0, observations: [] };
    }
    const unit = ctx.currentSearchUnit;
    const observations = rawCandidates.map(
      (raw) => createCandidateObservation(raw, {
        sessionId,
        searchUnitId: unit.searchUnitId,
        searchKeyword: unit.rawKeyword,
        searchLocation: unit.rawLocation,
        pageUrl,
        pageKind: "SEARCH_RESULTS"
      })
    );
    const registered = observations.map((obs) => ctx.deduplicator.register(obs).candidate);
    ctx.candidatesObserved.push(...observations);
    ctx.filterManager.ingestCandidates(registered);
    unit.candidateCount = ctx.deduplicator.size;
    return { count: observations.length, observations };
  }
  /**
   * Executes feed scrolling and live candidate observation for an active session.
   */
  async executeFeedScroll(sessionId, policyOverrides, domProvider) {
    const ctx = this._sessions.get(sessionId);
    if (!ctx) {
      return { success: false, error: `Session "${sessionId}" not found` };
    }
    if (!ctx.currentSearchUnit) {
      return { success: false, error: "No active search unit in session" };
    }
    const unit = ctx.currentSearchUnit;
    const provider = domProvider || (() => typeof document !== "undefined" ? document : null);
    const scrollEngine = new GoogleMapsFeedScrollEngine(
      provider,
      {
        sessionId,
        searchUnitId: unit.searchUnitId,
        searchKeyword: unit.rawKeyword,
        searchLocation: unit.rawLocation,
        pageUrl: unit.navigationUrl
      },
      policyOverrides,
      {
        onNewCandidates: (newObs) => {
          ctx.candidatesObserved.push(...newObs);
          ctx.filterManager.ingestCandidates(newObs);
          unit.candidateCount = ctx.deduplicator.size;
        },
        onBatchCompleted: (batch) => {
          ctx.batches.push(batch);
        },
        isPaused: () => ctx.stateMachine.state === "PAUSED",
        isCancelled: () => ctx.stateMachine.state === "CANCELLED",
        onDiagnostic: (diag) => {
          ctx.diagnostics.push(diag);
        }
      },
      ctx.deduplicator
    );
    ctx.scrollEngine = scrollEngine;
    const result = await scrollEngine.execute();
    const qProgress = ctx.queue.getProgress();
    await ctx.checkpointManager.createCheckpoint({
      sessionId,
      searchUnit: unit,
      state: ctx.stateMachine.state,
      pageUrl: unit.navigationUrl,
      observationSequence: scrollEngine.observationSequence,
      lastObservedCandidateIdentity: ctx.candidatesObserved[ctx.candidatesObserved.length - 1]?.observationId,
      duplicateSuppressionContext: {
        observedIds: ctx.deduplicator.knownCandidateIds
      },
      progress: {
        totalUnits: qProgress.total,
        completedUnits: qProgress.completed,
        pendingUnits: qProgress.queued
      }
    });
    return {
      success: true,
      sessionId,
      state: ctx.stateMachine.state,
      candidatesCount: ctx.deduplicator.size,
      newCandidatesCount: result.candidates.length,
      metrics: result.metrics,
      terminationReason: result.terminationReason,
      diagnostics: ctx.diagnostics
    };
  }
  /**
   * Diagnostic capability probe against current DOM.
   */
  probeLiveCapability(domRoot, url) {
    const root = domRoot || (typeof document !== "undefined" ? document : null);
    const targetUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const probe = probeGoogleMapsCapability(root, targetUrl);
    return {
      success: true,
      probe
    };
  }
  /**
   * Updates filter criteria for an active acquisition session or bulk run and returns the re-evaluated view.
   */
  setSessionFilter(sessionId, filter) {
    const validFilter = normalizeFilterCriteria(filter);
    const ctx = sessionId ? this._sessions.get(sessionId) : void 0;
    let bulk = sessionId ? this._bulkOrchestrators.get(sessionId) : void 0;
    if (!ctx && !bulk && this._bulkOrchestrators.size > 0) {
      const all = Array.from(this._bulkOrchestrators.values());
      bulk = all[all.length - 1];
    }
    if (!ctx && !bulk) {
      return { success: false, error: `Session "${sessionId || "default"}" not found` };
    }
    if (bulk) {
      bulk.setFilter(validFilter);
      const view2 = bulk.getFilterManager().getFilteredView();
      return {
        success: true,
        sessionId: bulk.getSnapshot().runId,
        view: view2,
        snapshot: bulk.getSnapshot()
      };
    }
    const manager = ctx.filterManager;
    const view = manager.setFilter(filter);
    return {
      success: true,
      sessionId,
      view
    };
  }
  /**
   * Resets active filters to default ANY / ANY for a session or bulk run.
   */
  resetSessionFilter(sessionId) {
    const ctx = this._sessions.get(sessionId);
    const bulk = this._bulkOrchestrators.get(sessionId);
    if (!ctx && !bulk) {
      return { success: false, error: `Session "${sessionId}" not found` };
    }
    const manager = bulk ? bulk.getFilterManager() : ctx.filterManager;
    const view = manager.resetFilters();
    return {
      success: true,
      sessionId,
      view
    };
  }
  /**
   * Retrieves the current filtered dataset view for a session or bulk run.
   */
  getSessionFilteredView(sessionId) {
    const ctx = this._sessions.get(sessionId);
    const bulk = this._bulkOrchestrators.get(sessionId);
    if (!ctx && !bulk) {
      return { success: false, error: `Session "${sessionId}" not found` };
    }
    const manager = bulk ? bulk.getFilterManager() : ctx.filterManager;
    const view = manager.getFilteredView();
    return {
      success: true,
      sessionId,
      view
    };
  }
  /**
   * Starts a bulk research run across Keywords x Locations (Part 4).
   * Guards against duplicate start if an active run exists.
   */
  async startBulkResearch(request, driver) {
    const tabDriver = driver || this._defaultDriver;
    let tabId = request.tabId ?? 0;
    if (tabId <= 0 && typeof chrome !== "undefined" && chrome.tabs && typeof chrome.tabs.query === "function") {
      try {
        const tabs = await chrome.tabs.query({});
        const targetTab = tabs.find((t) => t.url && !t.url.startsWith("chrome-extension://")) || tabs.find((t) => t.id && !t.active) || tabs[0];
        if (targetTab?.id) {
          tabId = targetTab.id;
        }
      } catch {
      }
    }
    const validation = validateBulkRequest(request);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Invalid bulk research request: ${validation.errors.join("; ")}`
      };
    }
    const plan = createBulkResearchPlan(request);
    const runId = request.runId || `brun_${plan.planFingerprint}`;
    const existing = this._bulkOrchestrators.get(runId);
    if (existing) {
      const snap = existing.getSnapshot();
      if (snap.state === "RUNNING" || snap.state === "QUEUED") {
        return {
          success: false,
          error: `A bulk research run (${runId}) is already active. Duplicate execution prevented.`,
          snapshot: snap
        };
      }
    }
    const orchestrator = new GoogleMapsBulkOrchestrator({
      plan,
      runId,
      tabDriver,
      tabId
    });
    this._bulkOrchestrators.set(runId, orchestrator);
    this._bulkOrchestrators.set(plan.planId, orchestrator);
    const snapshot = await orchestrator.start();
    return {
      success: true,
      sessionId: runId,
      snapshot
    };
  }
  async pauseBulkResearch(sessionId) {
    const orch = this._bulkOrchestrators.get(sessionId);
    if (!orch) {
      return { success: false, error: `Bulk research run "${sessionId}" not found` };
    }
    const snapshot = await orch.pause();
    return { success: true, sessionId, snapshot };
  }
  async resumeBulkResearch(sessionId) {
    const orch = this._bulkOrchestrators.get(sessionId);
    if (!orch) {
      return { success: false, error: `Bulk research run "${sessionId}" not found` };
    }
    const snapshot = await orch.resume();
    return { success: true, sessionId, snapshot };
  }
  async cancelBulkResearch(sessionId, reason) {
    const orch = this._bulkOrchestrators.get(sessionId);
    if (!orch) {
      return { success: false, error: `Bulk research run "${sessionId}" not found` };
    }
    const snapshot = await orch.cancel(reason);
    return { success: true, sessionId, snapshot };
  }
  getBulkResearchStatus(sessionId) {
    let orch = sessionId ? this._bulkOrchestrators.get(sessionId) : void 0;
    if (!orch && this._bulkOrchestrators.size > 0) {
      const all = Array.from(this._bulkOrchestrators.values());
      orch = all[all.length - 1];
    }
    if (!orch) {
      return { success: false, error: `Bulk research run "${sessionId || "default"}" not found` };
    }
    const snapshot = orch.getSnapshot();
    return { success: true, sessionId: snapshot.runId, snapshot };
  }
  getBulkOrchestrator(sessionId) {
    return this._bulkOrchestrators.get(sessionId);
  }
  getSession(sessionId) {
    return this._sessions.get(sessionId);
  }
  _buildSessionProgress(ctx) {
    const qp = ctx.queue.getProgress();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return {
      sessionId: ctx.sessionId,
      state: ctx.stateMachine.state,
      totalSearchUnits: qp.total,
      completedSearchUnits: qp.completed,
      currentSearchUnitId: ctx.currentSearchUnit?.searchUnitId,
      totalCandidatesObserved: ctx.candidatesObserved.length,
      uniqueCandidatesObserved: new Set(ctx.candidatesObserved.map((c) => c.observationId)).size,
      diagnosticsCount: ctx.diagnostics.length,
      startedAt: ctx.currentSearchUnit?.startedAt || now,
      lastActivityAt: now,
      completedAt: ctx.stateMachine.state === "COMPLETED" ? now : void 0
    };
  }
};
var googleMapsRuntimeCoordinator = new GoogleMapsRuntimeCoordinator();

// src/extension/leads/leadIdentity.ts
function generateDeterministicLeadId(domain, sourceAnchorId, prefix = "lead") {
  const normDomain = normalizeDomain(domain);
  const key = `${normDomain}|${sourceAnchorId || ""}`;
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hashHex = (hash >>> 0).toString(16).padStart(8, "0");
  return `${prefix}_det_${hashHex}`;
}
function normalizeDomain(urlOrDomain) {
  if (!urlOrDomain || typeof urlOrDomain !== "string") return "";
  let cleaned = urlOrDomain.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//i, "");
  cleaned = cleaned.split("/")[0].split("?")[0].split("#")[0];
  cleaned = cleaned.split(":")[0];
  cleaned = cleaned.replace(/^www\./i, "");
  return cleaned.trim();
}

// src/extension/leads/leadReducer.ts
var INITIAL_LEAD_WORKSPACE_STATE = Object.freeze({
  leads: Object.freeze({}),
  independentSources: Object.freeze({}),
  conflicts: Object.freeze([]),
  selectedLeadId: null,
  version: 1
});

// src/extension/leads/leadExportPolicy.ts
function sanitizeCsvCell(value) {
  if (value === null || value === void 0) return "";
  let str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
var FORBIDDEN_EXPORT_GOOGLE_KEYS = [
  "placeId",
  "mapsUrl",
  "rating",
  "reviewCount",
  "businessStatus",
  "candidateId"
];
function validateExportSafeLead(lead) {
  const errors = [];
  if (!lead || typeof lead !== "object") {
    return { isValid: false, errors: ["Export lead must be a non-null object"] };
  }
  const l = lead;
  if (typeof l.leadId !== "string" || !l.leadId.startsWith("lead_")) {
    errors.push(`Invalid leadId format: "${l.leadId}". Must begin with "lead_"`);
  }
  if (l.exportEligibility !== "ELIGIBLE") {
    errors.push(`Lead is not eligible for export (status: ${String(l.exportEligibility)})`);
  }
  if (!l.identity || typeof l.identity !== "object") {
    errors.push("Missing identity object");
  } else {
    if (typeof l.identity.businessName !== "string" || !l.identity.businessName.trim()) {
      errors.push("Missing identity.businessName");
    }
    if (typeof l.identity.domain !== "string" || !l.identity.domain.trim()) {
      errors.push("Missing identity.domain");
    }
  }
  if (l.sourceClass !== "USER_PROVIDED" && l.sourceClass !== "WEBSITE_PUBLIC" && l.sourceClass !== "LEADNORIA_DERIVED_FROM_NON_RESTRICTED_INPUT") {
    errors.push(`Disallowed export sourceClass: "${l.sourceClass}"`);
  }
  for (const forbidden of FORBIDDEN_EXPORT_GOOGLE_KEYS) {
    if (forbidden in l) {
      errors.push(`CRITICAL FIREWALL BREACH: Forbidden Google key "${forbidden}" present in export lead`);
    }
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}
function toExportRow(lead) {
  const validation = validateExportSafeLead(lead);
  if (!validation.isValid) {
    throw new Error(`Cannot export invalid lead "${lead?.leadId}": ${validation.errors.join("; ")}`);
  }
  const primaryEmail = lead.contact.publicEmails[0]?.email || "";
  const primaryPhone = lead.contact.publicPhones[0]?.phone || "";
  const primaryPerson = lead.person.leadershipPeople[0]?.fullName || "";
  const primaryRole = lead.person.leadershipPeople[0]?.jobTitle || "";
  return Object.freeze({
    leadId: lead.leadId,
    businessName: lead.identity.businessName,
    website: lead.identity.canonicalUrl,
    publicEmail: primaryEmail,
    publicPhone: primaryPhone,
    publicPersonName: primaryPerson,
    publicPersonRole: primaryRole,
    qualificationOutcome: lead.qualification.status,
    reviewOutcome: lead.reviewOutcome.reviewState,
    sourceClass: lead.sourceClass,
    evidenceTimestamp: lead.updatedAt
  });
}
function prepareLeadsForExport(leads) {
  const seenLeadIds = /* @__PURE__ */ new Set();
  const seenDomains = /* @__PURE__ */ new Set();
  const validLeads = [];
  let duplicateCount = 0;
  let rejectedCount = 0;
  for (const lead of leads) {
    const val = validateExportSafeLead(lead);
    if (!val.isValid) {
      rejectedCount++;
      continue;
    }
    const domainKey = lead.identity.domain.trim().toLowerCase();
    if (seenLeadIds.has(lead.leadId) || domainKey && seenDomains.has(domainKey)) {
      duplicateCount++;
      continue;
    }
    seenLeadIds.add(lead.leadId);
    if (domainKey) seenDomains.add(domainKey);
    validLeads.push(lead);
  }
  validLeads.sort((a, b) => {
    const nameA = a.identity.businessName.toLowerCase();
    const nameB = b.identity.businessName.toLowerCase();
    if (nameA !== nameB) return nameA.localeCompare(nameB);
    return a.leadId.localeCompare(b.leadId);
  });
  return { validLeads, duplicateCount, rejectedCount };
}
function exportLeadsToCsv(leads) {
  const headers = [
    "leadId",
    "businessName",
    "website",
    "publicEmail",
    "publicPhone",
    "publicPersonName",
    "publicPersonRole",
    "qualificationOutcome",
    "reviewOutcome",
    "sourceClass",
    "evidenceTimestamp"
  ];
  const headerRow = headers.map(sanitizeCsvCell).join(",");
  const rows = [headerRow];
  const { validLeads } = prepareLeadsForExport(leads);
  for (const lead of validLeads) {
    const rowObj = toExportRow(lead);
    const rowValues = [
      sanitizeCsvCell(rowObj.leadId),
      sanitizeCsvCell(rowObj.businessName),
      sanitizeCsvCell(rowObj.website),
      sanitizeCsvCell(rowObj.publicEmail),
      sanitizeCsvCell(rowObj.publicPhone),
      sanitizeCsvCell(rowObj.publicPersonName),
      sanitizeCsvCell(rowObj.publicPersonRole),
      sanitizeCsvCell(rowObj.qualificationOutcome),
      sanitizeCsvCell(rowObj.reviewOutcome),
      sanitizeCsvCell(rowObj.sourceClass),
      sanitizeCsvCell(rowObj.evidenceTimestamp)
    ];
    rows.push(rowValues.join(","));
  }
  return rows.join("\r\n");
}
function exportLeadsToJson(leads) {
  const { validLeads } = prepareLeadsForExport(leads);
  const exportable = validLeads.map(toExportRow);
  return JSON.stringify(exportable, null, 2);
}
function exportLeadsWithReconciliation(leads) {
  const { validLeads, duplicateCount, rejectedCount } = prepareLeadsForExport(leads);
  const csv = exportLeadsToCsv(leads);
  const json = exportLeadsToJson(leads);
  const totalInputCount = leads.length;
  const exportedCount = validLeads.length;
  const isReconciled = totalInputCount === exportedCount + duplicateCount + rejectedCount;
  return Object.freeze({
    totalInputCount,
    eligibleCount: exportedCount,
    exportedCount,
    duplicateSuppressedCount: duplicateCount,
    rejectedCount,
    csv,
    json,
    isReconciled
  });
}

// src/extension/leads/workspace/workspaceReducer.ts
var INITIAL_WORKSPACE_STATE = Object.freeze({
  leads: Object.freeze([]),
  filterCriteria: Object.freeze({ isArchived: false }),
  sortCriteria: Object.freeze({ field: "updatedAt", direction: "DESC" }),
  pagination: Object.freeze({ page: 1, pageSize: 20 }),
  selectedLeadId: null,
  isLoading: false,
  error: null
});

// src/extension/service-worker.ts
var canonicalRecordAssembler = new RecordAssembler();
console.log("[Meta Ad Library Scraper] Service Worker initializing...");
var SCHEMA_VERSION = 1;
var STALE_JOB_THRESHOLD_MS = 5 * 60 * 1e3;
var cancelledRuns = /* @__PURE__ */ new Set();
async function saveActiveRun(run) {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    run.lastUpdatedAt = (/* @__PURE__ */ new Date()).toISOString();
    run.schemaVersion = SCHEMA_VERSION;
    await chrome.storage.local.set({
      activeResearchRun: run,
      meta_scraper_active_run: run
    });
  }
}
async function checkStaleJobs() {
  if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) return;
  const data = await chrome.storage.local.get(["activeResearchRun"]);
  const run = data.activeResearchRun;
  if (run && ["STARTING", "NAVIGATING", "COLLECTING", "NORMALIZING"].includes(run.status)) {
    const lastUpdate = new Date(run.lastUpdatedAt).getTime();
    const now = Date.now();
    if (now - lastUpdate > STALE_JOB_THRESHOLD_MS) {
      console.warn("[service-worker] Detected stale job:", run.runId);
      run.status = "RECOVERY_REQUIRED";
      run.stopReason = "BROWSER_INTERRUPTED";
      run.logs.push({
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
        message: "Research session was interrupted due to browser inactivity or background worker restart. Recovery required.",
        stage: "SYSTEM"
      });
      await saveActiveRun(run);
      await appendToHistory(run);
    }
  }
}
async function appendToHistory(run) {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get(["researchHistory", "meta_scraper_history"]);
    const history = Array.isArray(data.researchHistory) ? data.researchHistory : Array.isArray(data.meta_scraper_history) ? data.meta_scraper_history : [];
    const updated = [run, ...history.filter((h) => h.runId !== run.runId)].slice(0, 30);
    await chrome.storage.local.set({
      researchHistory: updated,
      meta_scraper_history: updated
    });
  }
}
function broadcastProgress(run, stage, logMessage) {
  const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString();
  run.logs.push({ timestamp, message: logMessage, stage });
  if (run.logs.length > 50) {
    run.logs = run.logs.slice(-50);
  }
  saveActiveRun(run).catch(() => {
  });
  const authoritativeLeadCount = run.counters?.finalUniqueRelevantLeads ?? run.counters?.finalUniqueLeads ?? run.leads.length;
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: "RESEARCH_PROGRESS",
      payload: {
        runId: run.runId,
        status: run.status,
        leadCount: authoritativeLeadCount,
        maxResults: run.maxResults,
        totalAdsInspected: run.totalAdsInspected,
        logMessage,
        run
      }
    }).catch(() => {
    });
  }
}
function waitForTabLoad(tabId, timeoutMs = 25e3) {
  return new Promise(async (resolve) => {
    let resolved = false;
    try {
      const currentTab = await chrome.tabs.get(tabId);
      if (currentTab && currentTab.status === "complete") {
        resolved = true;
        resolve();
        return;
      }
    } catch {
    }
    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        if (!resolved) {
          resolved = true;
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }, timeoutMs);
  });
}
var wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function executeResearchPipeline(payload, providedRunId, providedRun) {
  const runId = providedRunId || `run_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  cancelledRuns.delete(runId);
  const keywords = payload.keywords.map((k) => k.trim()).filter(Boolean);
  const countryCode = payload.countryCode || "US";
  const isAutoDiscovery = payload.researchMode === "AUTO_DISCOVERY" || payload.maxResults === void 0;
  const effectiveCeiling = isAutoDiscovery ? MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH : Math.min(Math.max(1, payload.maxResults || MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH), MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH);
  const targetLeadCount = isAutoDiscovery ? void 0 : effectiveCeiling;
  const researchIntent = compileResearchIntent(
    payload.mode,
    keywords,
    payload.presetId,
    countryCode
  );
  const initialRun = providedRun || {
    runId,
    researchName: payload.researchName || `${payload.mode === "PRESET" ? payload.presetName || "Preset" : keywords[0]} in ${payload.locationName}`,
    mode: payload.mode,
    presetId: payload.presetId,
    presetName: payload.presetName,
    keywords,
    countryCode,
    locationName: payload.locationName,
    researchMode: isAutoDiscovery ? "AUTO_DISCOVERY" : void 0,
    maxFinalUniqueRelevantLeads: isAutoDiscovery ? MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH : void 0,
    maxResults: payload.maxResults ?? effectiveCeiling,
    targetLeadCount,
    status: "STARTING",
    leads: [],
    rejectedLeadsCount: 0,
    uncertainLeadsCount: 0,
    relevanceStrategyVersion: RELEVANCE_STRATEGY_VERSION,
    engineVersion: RELEVANCE_ENGINE_VERSION,
    counters: {
      rawAds: 0,
      normalizedCandidates: 0,
      relevantCandidates: 0,
      uncertainCandidates: 0,
      notRelevantCandidates: 0,
      duplicatesRemoved: 0,
      finalUniqueLeads: 0
    },
    logs: [],
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    schemaVersion: SCHEMA_VERSION,
    totalAdsInspected: 0
  };
  await initBulkStore();
  const seenAdLibraryIds = await getSeenAdIds(runId);
  const seenEntityKeys = await getSeenEntityKeys(runId);
  const existingEntitiesMap = /* @__PURE__ */ new Map();
  const existingLeads = await getAllRelevantLeads(runId);
  for (const lead of existingLeads) {
    const canonicalKey = lead.canonicalName ? lead.canonicalName.toLowerCase() : lead.name.toLowerCase();
    existingEntitiesMap.set(canonicalKey, lead);
  }
  await saveActiveRun(initialRun);
  const plannedQueries = initialRun.plannedQueries || planResearchQueries({
    seedKeywords: keywords,
    countryCode,
    runId,
    maxQueries: MAX_QUERIES_PER_RESEARCH_RUN
  });
  initialRun.plannedQueries = plannedQueries;
  const queryFrontier = initialRun.queryFrontier ? QueryFrontier.restore(initialRun.queryFrontier) : new QueryFrontier(
    runId,
    plannedQueries,
    initialRun.frontier?.completedKeywords || [],
    initialRun.activeQueryIndex ?? initialRun.activeKeywordIndex ?? 0
  );
  initialRun.queryFrontier = queryFrontier.serialize();
  const queriesToRun = plannedQueries.map((p) => p.query);
  const startBroadcastMsg = isAutoDiscovery ? `Auto-discovery research initiated in ${payload.locationName} (${queriesToRun.length} planned queries)...` : `Research initiated for ${targetLeadCount} leads in ${payload.locationName} (${queriesToRun.length} planned queries)...`;
  broadcastProgress(initialRun, "STARTING", startBroadcastMsg);
  let currentTabId = null;
  const startQi = initialRun.activeQueryIndex ?? initialRun.activeKeywordIndex ?? 0;
  const completedKeywords = [...initialRun.frontier?.completedKeywords || []];
  let isStalled = false;
  let batchIndex = initialRun.lastCheckpointBatch || 0;
  try {
    for (let qi = startQi; qi < queriesToRun.length; qi++) {
      if (cancelledRuns.has(runId)) break;
      const currentLeadCount = initialRun.counters?.finalUniqueRelevantLeads ?? initialRun.counters?.finalUniqueLeads ?? existingEntitiesMap.size;
      if (currentLeadCount >= effectiveCeiling) break;
      if (queryFrontier.getSaturationState().isSaturated) {
        broadcastProgress(initialRun, "COLLECTING", "Discovery saturation reached (consecutive queries produced zero new unique entities). Finalizing research.");
        break;
      }
      const currentPlannedQuery = plannedQueries[qi];
      const currentKeyword = currentPlannedQuery.query;
      initialRun.activeKeywordIndex = qi;
      initialRun.activeQueryIndex = qi;
      initialRun.currentKeyword = currentKeyword;
      initialRun.keywordsCompleted = completedKeywords.length;
      initialRun.totalKeywords = queriesToRun.length;
      initialRun.status = "NAVIGATING";
      let queryRawAds = 0;
      let queryNormalizedAds = 0;
      let queryNewEntities = 0;
      let queryDuplicateEntities = 0;
      const searchUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${encodeURIComponent(countryCode)}&q=${encodeURIComponent(currentKeyword)}`;
      const queryTypeLabel = currentPlannedQuery.variantType === "SEED" ? "Primary Seed" : `Expansion: ${currentPlannedQuery.variantType}`;
      broadcastProgress(initialRun, "NAVIGATING", `[${qi + 1}/${queriesToRun.length} ${queryTypeLabel}] Opening Meta Ad Library for "${currentKeyword}" in ${countryCode}...`);
      if (!currentTabId) {
        const tab = await chrome.tabs.create({ url: searchUrl, active: false });
        currentTabId = tab.id || null;
      } else {
        await chrome.tabs.update(currentTabId, { url: searchUrl });
      }
      if (!currentTabId) {
        throw new Error("Failed to create or update browser tab for research.");
      }
      await waitForTabLoad(currentTabId);
      await wait(3e3);
      initialRun.status = "COLLECTING";
      broadcastProgress(initialRun, "COLLECTING", `Connected to Ad Library. Starting ad collection for "${currentKeyword}"...`);
      let consecutiveNoNewCards = 0;
      let scrollAttempts = 0;
      const maxScrolls = isAutoDiscovery ? 60 : Math.max(25, Math.ceil((targetLeadCount || 10) * 3));
      while (scrollAttempts < maxScrolls && !cancelledRuns.has(runId)) {
        const liveCount = initialRun.counters?.finalUniqueRelevantLeads ?? initialRun.counters?.finalUniqueLeads ?? existingEntitiesMap.size;
        if (liveCount >= effectiveCeiling) break;
        scrollAttempts++;
        try {
          const tabCheck = await chrome.tabs.get(currentTabId);
          if (!tabCheck) {
            initialRun.status = "BROWSER_TAB_CLOSED";
            initialRun.stopReason = "BROWSER_TAB_CLOSED";
            broadcastProgress(initialRun, "BROWSER_TAB_CLOSED", "Ad Library tab was closed during research.");
            break;
          }
        } catch {
          initialRun.status = "BROWSER_TAB_CLOSED";
          initialRun.stopReason = "BROWSER_TAB_CLOSED";
          broadcastProgress(initialRun, "BROWSER_TAB_CLOSED", "Ad Library tab was closed during research.");
          break;
        }
        let response = null;
        try {
          response = await chrome.tabs.sendMessage(currentTabId, {
            type: "SCAN_AND_EXTRACT",
            payload: { keyword: currentKeyword, scroll: true }
          });
        } catch (err) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId: currentTabId },
              files: ["content-script.js"]
            });
            await wait(1e3);
            response = await chrome.tabs.sendMessage(currentTabId, {
              type: "SCAN_AND_EXTRACT",
              payload: { keyword: currentKeyword, scroll: true }
            });
          } catch (scriptErr) {
            broadcastProgress(initialRun, "COLLECTING", `Tab communication retry: ${scriptErr.message}`);
          }
        }
        if (response && response.type === "CHALLENGE_DETECTED") {
          const isRateLimit = response.code === "RATE_LIMITED" || response.reason && response.reason.includes("rate limit");
          initialRun.status = isRateLimit ? "RATE_LIMITED" : "CHALLENGED";
          initialRun.challengeReason = response.reason || "Meta Ad Library security challenge presented.";
          initialRun.stopReason = isRateLimit ? "RATE_LIMITED" : "CHALLENGED";
          broadcastProgress(initialRun, initialRun.status, `Access restricted: ${initialRun.challengeReason}`);
          await saveRunRecord(initialRun);
          await saveActiveRun(initialRun);
          await appendToHistory(initialRun);
          return initialRun;
        }
        const candidates = response && response.payload && response.payload.candidates || [];
        if (candidates.length > 0) {
          batchIndex++;
          const batchResult = await processBatch(
            candidates,
            existingEntitiesMap,
            seenAdLibraryIds,
            seenEntityKeys,
            initialRun.counters || {
              rawAds: 0,
              normalizedCandidates: 0,
              relevantCandidates: 0,
              uncertainCandidates: 0,
              notRelevantCandidates: 0,
              duplicatesRemoved: 0,
              finalUniqueLeads: 0,
              uniqueEntitiesObserved: 0,
              relevantEntities: 0,
              uncertainEntities: 0,
              notRelevantEntities: 0,
              keywordsCompleted: completedKeywords.length,
              keywordsTotal: keywords.length,
              finalUniqueRelevantLeads: 0,
              reasonCodes: {}
            },
            {
              runId,
              countryCode,
              locationName: payload.locationName,
              currentKeyword,
              intent: researchIntent,
              effectiveCeiling
            }
          );
          queryRawAds += candidates.length;
          queryNormalizedAds += batchResult.processedAds.length;
          queryNewEntities += batchResult.newEntityKeysAdded.length;
          queryDuplicateEntities += candidates.length - batchResult.processedAds.length;
          await saveBatch(runId, {
            batchIndex,
            ads: batchResult.processedAds,
            entities: batchResult.updatedEntities,
            evidence: batchResult.newEvidence,
            uncertainEntities: batchResult.uncertainEntities,
            checkpoint: {
              runId,
              batchIndex,
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              activeKeywordIndex: qi,
              currentKeyword,
              rawAdsCount: batchResult.counters.rawAds,
              normalizedCandidatesCount: batchResult.counters.normalizedCandidates,
              uniqueEntitiesCount: batchResult.counters.uniqueEntitiesObserved || 0,
              relevantEntitiesCount: batchResult.counters.relevantEntities || 0,
              uncertainEntitiesCount: batchResult.counters.uncertainEntities || 0,
              notRelevantEntitiesCount: batchResult.counters.notRelevantEntities || 0,
              duplicatesRemovedCount: batchResult.counters.duplicatesRemoved,
              finalUniqueRelevantLeads: batchResult.counters.finalUniqueRelevantLeads || batchResult.counters.finalUniqueLeads,
              seenLibraryIdsCount: seenAdLibraryIds.size,
              seenEntityKeysCount: seenEntityKeys.size
            }
          });
          const allLeadsList = Array.from(existingEntitiesMap.values());
          initialRun.leads = allLeadsList.slice(0, 50);
          initialRun.totalAdsInspected = batchResult.counters.rawAds;
          initialRun.counters = batchResult.counters;
          initialRun.rejectedLeadsCount = batchResult.counters.notRelevantCandidates;
          initialRun.uncertainLeadsCount = batchResult.counters.uncertainCandidates;
          initialRun.lastCheckpointBatch = batchIndex;
          initialRun.currentKeyword = currentKeyword;
          initialRun.keywordsCompleted = completedKeywords.length;
          initialRun.totalKeywords = queriesToRun.length;
          initialRun.entitiesEvaluated = batchResult.counters.uniqueEntitiesObserved || 0;
          initialRun.frontier = {
            activeKeywordIndex: qi,
            keywords: queriesToRun,
            currentKeyword,
            completedKeywords: [...completedKeywords],
            seenLibraryIdsCount: seenAdLibraryIds.size,
            seenEntityKeysCount: seenEntityKeys.size,
            lastBatchIndex: batchIndex,
            checkpointTimestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
          if (batchResult.processedAds.length === 0) {
            consecutiveNoNewCards++;
          } else {
            consecutiveNoNewCards = 0;
          }
          candidates.length = 0;
          batchResult.processedAds.length = 0;
          broadcastProgress(
            initialRun,
            "COLLECTING",
            `Discovered ${initialRun.counters.finalUniqueRelevantLeads || initialRun.counters.finalUniqueLeads} leads | Inspected ${initialRun.counters.rawAds} ads | Evaluated ${initialRun.counters.uniqueEntitiesObserved || 0} entities (${currentKeyword})...`
          );
          const finalLeadsCount = initialRun.counters.finalUniqueRelevantLeads || initialRun.counters.finalUniqueLeads;
          if (batchResult.safetyLimitReached || finalLeadsCount >= effectiveCeiling) {
            if (isAutoDiscovery) {
              broadcastProgress(initialRun, "NORMALIZING", `5,000-lead safety limit reached.`);
            } else {
              broadcastProgress(initialRun, "NORMALIZING", `Target lead quota of ${targetLeadCount} reached.`);
            }
            break;
          }
          if (response.payload && response.payload.atBottom && consecutiveNoNewCards >= 2) {
            broadcastProgress(initialRun, "COLLECTING", `Reached end of public search results for "${currentKeyword}".`);
            break;
          }
          if (consecutiveNoNewCards >= 3) {
            isStalled = true;
            broadcastProgress(initialRun, "COLLECTING", `No additional ad cards loaded for "${currentKeyword}". Moving forward.`);
            break;
          }
        } else {
          broadcastProgress(initialRun, "COLLECTING", `Waiting for ad cards to render (attempt ${scrollAttempts})...`);
          await wait(2e3);
        }
      }
      queryFrontier.recordQueryMetrics(qi, {
        rawAds: queryRawAds,
        normalizedAds: queryNormalizedAds,
        newUniqueEntities: queryNewEntities,
        duplicateEntities: queryDuplicateEntities,
        rejectedByRelevance: 0,
        uncertainByRelevance: 0
      });
      initialRun.queryFrontier = queryFrontier.serialize();
      completedKeywords.push(currentKeyword);
      initialRun.keywordsCompleted = completedKeywords.length;
      if ((initialRun.counters?.finalUniqueRelevantLeads || initialRun.counters?.finalUniqueLeads || 0) >= effectiveCeiling) {
        break;
      }
    }
    const finalLeadCount = initialRun.counters?.finalUniqueRelevantLeads ?? initialRun.counters?.finalUniqueLeads ?? existingEntitiesMap.size;
    if (cancelledRuns.has(runId)) {
      initialRun.status = "CANCELLED";
      initialRun.stopReason = "USER_CANCELLED";
      broadcastProgress(initialRun, "CANCELLED", `Research was explicitly cancelled by user.`);
    } else if (initialRun.stopReason === "BROWSER_TAB_CLOSED" || initialRun.status === "BROWSER_TAB_CLOSED") {
      initialRun.status = "BROWSER_TAB_CLOSED";
      initialRun.stopReason = "BROWSER_TAB_CLOSED";
      broadcastProgress(initialRun, "BROWSER_TAB_CLOSED", `Research halted because the Ad Library tab was closed.`);
    } else if (initialRun.status === "CHALLENGED" || initialRun.status === "RATE_LIMITED" || initialRun.status === "BLOCKED") {
    } else if (finalLeadCount >= effectiveCeiling) {
      initialRun.status = "COMPLETED";
      if (isAutoDiscovery) {
        initialRun.stopReason = "SAFETY_LIMIT_REACHED";
        broadcastProgress(
          initialRun,
          "COMPLETED",
          `Research stopped at the current system safety limit of 5,000 unique relevant leads.`
        );
      } else {
        initialRun.stopReason = "TARGET_REACHED";
        broadcastProgress(
          initialRun,
          "COMPLETED",
          `Target lead quota of ${targetLeadCount} reached.`
        );
      }
    } else {
      initialRun.status = "PARTIAL";
      if (initialRun.totalAdsInspected === 0) {
        initialRun.stopReason = "NO_NEW_RESULTS_OBSERVED";
      } else if (isStalled) {
        initialRun.stopReason = "SOURCE_PROGRESS_STALLED";
      } else {
        initialRun.stopReason = "SOURCE_EXHAUSTED";
      }
      initialRun.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      const completionMsg = isAutoDiscovery ? `Auto-discovery finished (${initialRun.status} / ${initialRun.stopReason}): ${finalLeadCount} qualifying unique relevant leads discovered from ${initialRun.totalAdsInspected} public ads.` : `Research finished (${initialRun.status} / ${initialRun.stopReason}): ${finalLeadCount} of ${targetLeadCount} requested unique relevant leads observed from ${initialRun.totalAdsInspected} public ads.`;
      broadcastProgress(
        initialRun,
        initialRun.status,
        completionMsg
      );
    }
  } catch (err) {
    initialRun.status = "FAILED";
    initialRun.stopReason = "FAILED";
    initialRun.challengeReason = err.message || "Unexpected error occurred during research.";
    broadcastProgress(initialRun, "FAILED", `Error: ${initialRun.challengeReason}`);
  } finally {
    if (currentTabId) {
      try {
        await chrome.tabs.remove(currentTabId);
      } catch {
      }
    }
    initialRun.completedAt = (/* @__PURE__ */ new Date()).toISOString();
    await saveRunRecord(initialRun);
    await saveActiveRun(initialRun);
    await appendToHistory(initialRun);
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: "RESEARCH_COMPLETED",
        payload: { run: initialRun }
      }).catch(() => {
      });
    }
  }
  return initialRun;
}
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && typeof message === "object" && (message.source === "GMAPS_ENGINE" || typeof message.type === "string" && message.type.includes("_GMAPS_"))) {
      googleMapsRuntimeCoordinator.handleAcquisitionMessage(message, sender).then((res) => sendResponse(res)).catch((err) => sendResponse({ success: false, error: err?.message || String(err) }));
      return true;
    }
    if (message.type === "START_RESEARCH") {
      chrome.storage.local.get(["activeResearchRun"], (data) => {
        const activeRun = data.activeResearchRun;
        if (activeRun && ["STARTING", "NAVIGATING", "COLLECTING", "NORMALIZING"].includes(activeRun.status)) {
          const lastUpdate = new Date(activeRun.lastUpdatedAt).getTime();
          if (Date.now() - lastUpdate < STALE_JOB_THRESHOLD_MS) {
            sendResponse({ success: false, error: "A research job is already active." });
            return;
          }
        }
        const runId = `run_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        const isAutoDiscovery = message.payload.researchMode === "AUTO_DISCOVERY" || message.payload.maxResults === void 0;
        const effectiveCeiling = isAutoDiscovery ? MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH : Math.min(Math.max(1, message.payload.maxResults || MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH), MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH);
        const targetLeadCount = isAutoDiscovery ? void 0 : effectiveCeiling;
        const keywords = message.payload.keywords.map((k) => (k || "").trim()).filter(Boolean);
        const initialRun = {
          runId,
          researchName: message.payload.researchName || `${message.payload.mode === "PRESET" ? message.payload.presetName || "Preset" : keywords[0]} in ${message.payload.locationName}`,
          mode: message.payload.mode,
          presetId: message.payload.presetId,
          presetName: message.payload.presetName,
          keywords,
          countryCode: message.payload.countryCode || "US",
          locationName: message.payload.locationName,
          researchMode: isAutoDiscovery ? "AUTO_DISCOVERY" : void 0,
          maxFinalUniqueRelevantLeads: isAutoDiscovery ? MAX_FINAL_UNIQUE_RELEVANT_LEADS_PER_RESEARCH : void 0,
          maxResults: message.payload.maxResults ?? effectiveCeiling,
          targetLeadCount,
          status: "STARTING",
          leads: [],
          rejectedLeadsCount: 0,
          uncertainLeadsCount: 0,
          relevanceStrategyVersion: RELEVANCE_STRATEGY_VERSION,
          engineVersion: RELEVANCE_ENGINE_VERSION,
          counters: {
            rawAds: 0,
            normalizedCandidates: 0,
            relevantCandidates: 0,
            uncertainCandidates: 0,
            notRelevantCandidates: 0,
            duplicatesRemoved: 0,
            finalUniqueLeads: 0
          },
          logs: [],
          startedAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          schemaVersion: SCHEMA_VERSION,
          totalAdsInspected: 0
        };
        saveActiveRun(initialRun).catch(() => {
        });
        executeResearchPipeline(message.payload, runId, initialRun).catch((err) => {
          console.error("[service-worker] Background pipeline error:", err);
        });
        sendResponse({ success: true, runId, run: initialRun });
      });
      return true;
    }
    if (message.type === "STOP_RESEARCH" || message.type === "CANCEL_RESEARCH") {
      const runId = message.payload?.runId;
      if (runId) {
        cancelledRuns.add(runId);
      }
      chrome.storage.local.get(["activeResearchRun"], (data) => {
        if (data && data.activeResearchRun) {
          const run = data.activeResearchRun;
          run.status = "CANCELLED";
          run.stopReason = "USER_CANCELLED";
          saveActiveRun(run).catch(() => {
          });
        }
      });
      sendResponse({ success: true, message: "Cancellation signal sent." });
      return false;
    }
    if (message.type === "GET_STATE") {
      chrome.storage.local.get(["activeResearchRun"], (result) => {
        sendResponse({ activeResearchRun: result.activeResearchRun || null });
      });
      return true;
    }
    if (message.type === "GET_HISTORY") {
      chrome.storage.local.get(["researchHistory"], (result) => {
        sendResponse({ history: result.researchHistory || [] });
      });
      return true;
    }
    if (message.type === "CLEAR_HISTORY") {
      chrome.storage.local.set({ researchHistory: [] }, () => {
        sendResponse({ success: true });
      });
      return true;
    }
    if (message.type === "GET_ALL_LEADS_FOR_EXPORT") {
      const targetRunId = message.payload?.runId;
      if (!targetRunId) {
        sendResponse({ success: false, error: "runId required" });
        return false;
      }
      getAllRelevantLeads(targetRunId).then((leads) => {
        sendResponse({ success: true, leads });
      }).catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
      return true;
    }
    if (message.type === "RESUME_RESEARCH") {
      const targetRunId = message.payload?.runId;
      chrome.storage.local.get(["activeResearchRun"], async (data) => {
        const activeRun = data.activeResearchRun;
        if (!activeRun || targetRunId && activeRun.runId !== targetRunId) {
          sendResponse({ success: false, error: "No matching research run available to resume." });
          return;
        }
        activeRun.status = "STARTING";
        await saveActiveRun(activeRun);
        executeResearchPipeline(
          {
            mode: activeRun.mode,
            presetId: activeRun.presetId,
            presetName: activeRun.presetName,
            keywords: activeRun.keywords,
            countryCode: activeRun.countryCode,
            locationName: activeRun.locationName,
            researchName: activeRun.researchName,
            researchMode: activeRun.researchMode,
            maxResults: activeRun.maxResults
          },
          activeRun.runId,
          activeRun
        ).catch((err) => {
          console.error("[service-worker] Resume execution error:", err);
        });
        sendResponse({ success: true, run: activeRun });
      });
      return true;
    }
    if (message.type === "VERIFY_WEBSITE") {
      const { leadId } = message.payload || {};
      chrome.storage.local.get(["activeResearchRun"], async (data) => {
        const activeRun = data.activeResearchRun;
        if (!activeRun) {
          sendResponse({ success: false, error: "No active research run found" });
          return;
        }
        const targetLead = activeRun.leads.find((l) => l.id === leadId);
        if (!targetLead) {
          sendResponse({ success: false, error: `Lead not found: ${leadId}` });
          return;
        }
        try {
          targetLead.websiteVerificationStatus = "VERIFYING";
          await saveActiveRun(activeRun);
          const record = await verifyLeadWebsite(targetLead);
          targetLead.websiteVerificationStatus = record.status;
          targetLead.websiteVerification = record;
          await saveActiveRun(activeRun);
          sendResponse({ success: true, record, lead: targetLead });
        } catch (err) {
          targetLead.websiteVerificationStatus = "INVALID";
          await saveActiveRun(activeRun);
          sendResponse({ success: false, error: err.message });
        }
      });
      return true;
    }
    if (message.type === "EVALUATE_BUSINESS_QUALIFICATION") {
      try {
        const payload = message.payload || {};
        const profiles = {
          CANONICAL_DEFAULT_PROFILE,
          LOCAL_SERVICE_BUSINESS_PROFILE,
          B2B_PROSPECT_PROFILE,
          DIGITAL_COMMERCE_BUSINESS_PROFILE,
          HIGH_CONTACTABILITY_PROFILE
        };
        const profile = payload.profile || typeof payload.profileId === "string" && profiles[payload.profileId] || CANONICAL_DEFAULT_PROFILE;
        const bi = payload.businessIntelligence || (payload.buildParams ? buildBusinessIntelligenceProfile(payload.buildParams) : void 0);
        const context = {
          entityId: payload.entityId || "entity_direct",
          businessIntelligence: bi,
          websiteState: payload.websiteState,
          sourceContributions: payload.sourceContributions
        };
        const decision = evaluateLeadQualification(context, profile);
        sendResponse({ success: true, decision, businessIntelligence: bi });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      return true;
    }
    if (message.type === "ASSEMBLE_CANONICAL_LEAD") {
      try {
        const payload = message.payload || {};
        const canonicalRecord = canonicalRecordAssembler.assemble(payload);
        const exportEvaluation = canonicalRecordAssembler.evaluateExport(canonicalRecord);
        sendResponse({
          success: true,
          canonicalRecord,
          exportEvaluation
        });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      return true;
    }
    if (message.type === "EXPORT_LEADS_RECONCILED") {
      try {
        const payload = message.payload || {};
        const leads = Array.isArray(payload.leads) ? payload.leads : [];
        const summary = exportLeadsWithReconciliation(leads);
        sendResponse({
          success: true,
          summary
        });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      return true;
    }
    if (message.type === "GENERATE_DETERMINISTIC_LEAD_ID") {
      try {
        const payload = message.payload || {};
        const leadId = generateDeterministicLeadId(payload.domain || "", payload.sourceAnchorId);
        sendResponse({
          success: true,
          leadId
        });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
      return true;
    }
    if (message.type === "QUALIFY_GMAPS_CANDIDATE") {
      try {
        const payload = message.payload || {};
        const candidate = payload.candidate;
        const filters = payload.filters || {
          rating: payload.ratingFilter || "ANY",
          website: payload.websiteFilter || "ANY",
          maxResults: payload.maxResults
        };
        const qualificationResult = qualifiesCandidate(candidate, filters);
        sendResponse({
          success: true,
          qualificationResult,
          ratingSignal: extractRatingSignal(candidate),
          websiteState: determineWebsiteState2(candidate)
        });
      } catch (err) {
        sendResponse({ success: false, error: err?.message || String(err) });
      }
      return true;
    }
    if (message.type === "QUALIFY_GMAPS_BATCH") {
      try {
        const payload = message.payload || {};
        const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
        const filters = payload.filters || {
          rating: payload.ratingFilter || "ANY",
          website: payload.websiteFilter || "ANY",
          maxResults: payload.maxResults
        };
        const results = candidates.map((c) => ({
          candidate: c,
          qualification: qualifiesCandidate(c, filters)
        }));
        sendResponse({
          success: true,
          total: results.length,
          qualifiedCount: results.filter((r) => r.qualification.qualified).length,
          results
        });
      } catch (err) {
        sendResponse({ success: false, error: err?.message || String(err) });
      }
      return true;
    }
    if (message.type === "EXECUTE_GMAPS_MULTI_QUERY_RESEARCH") {
      try {
        const payload = message.payload || {};
        const queries = Array.isArray(payload.queries) ? payload.queries : [];
        const filters = payload.filters || {
          rating: payload.ratingFilter || "ANY",
          website: payload.websiteFilter || "ANY",
          maxResults: payload.maxResults
        };
        const options = {
          keywords: queries,
          filters,
          maxResults: filters.maxResults,
          ...payload.options
        };
        const executeQueryFn = payload.executeQuery || (async () => []);
        executeMultiQueryResearch(options, executeQueryFn).then((result) => sendResponse({ success: true, result })).catch((err) => sendResponse({ success: false, error: err?.message || String(err) }));
      } catch (err) {
        sendResponse({ success: false, error: err?.message || String(err) });
      }
      return true;
    }
    return false;
  });
}
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener(() => {
    console.log("[Meta Ad Library Scraper] Extension installed successfully.");
  });
}
checkStaleJobs().catch((err) => console.error("[service-worker] checkStaleJobs error:", err));
