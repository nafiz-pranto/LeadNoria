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
    return false;
  });
}
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener(() => {
    console.log("[Meta Ad Library Scraper] Extension installed successfully.");
  });
}
checkStaleJobs().catch((err) => console.error("[service-worker] checkStaleJobs error:", err));
