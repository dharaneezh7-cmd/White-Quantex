const fs = require('fs');
const path = require('path');

// 225 existing tickers in companies table to avoid collisions
const existingCompanyTickers = new Set([
  'AEAS','AEEN','AEOR','AERO','AETH','AGRD','APLI','ASDY','ASFR','ASRO','ASSP','ASSY','AUCL','AUCR','AUEC','AURA','AUTH','AUVA','AXRO',
  'BABA','BIBI','BICL','BIHE','BISY','BVGD','CAEN','CAFU','CAHA','CAPO','CARB','CESY','CGNS','CLBA','CLCA','CLHU','COAI','COEN','COFU',
  'COIN','COMA','CONE','CURO','CYBR','CYSP','DAST','DASY','DECO','DELA','DESY','DFRG','ECPO','EQCA','EQSE','EQTR','EXMA','EXOA','EXSP',
  'FLCR','FLED','FLFI','FOST','FUSE','GECA','GEEC','GEHE','GELA','GERO','GESY','GGRID','HEBI','HEDY','HEEC','HETH','HEVA','HLIX','HYCO',
  'HYNE','HYRO','HYST','IMBI','IMRO','INCL','INCO','INEN','ININ','INLA','INME','INMI','INNE','INOP','INSE','INSH','INSP','KIEX','KITR',
  'LOIN','LOLO','LOMA','LORO','LOSP','LUCA','LUEC','LUEN','LUTH','MEBI','MECO','MEDS','MEHU','MEIN','MEOP','MERO','MESY','MICO','NALA',
  'NASY','NEEN','NELO','NETR','NEVA','NOEX','NOLA','NOMA','NOPA','NOSP','NPAY','OMCO','OMLA','OMMA','OMNI','OMSY','OMTR','ONSY','OPBA',
  'OPSP','OPST','OPSY','ORAS','ORBD','ORDY','PIAS','PIFR','PRCA','PRLE','PRLI','PUCE','PULSE','PUMA','PURO','PUSY','PUTH','PUVA','QMAT',
  'QUAE','QUFU','QUMA','RBCD','SESP','SGLD','SHFL','SHFO','SHOP','SHRV','SHSP','SHVA','SOAS','SOBA','SODI','SOEX','SOFI','SOFR','SOMA',
  'SORA','SOST','STFL','STME','STPR','STSE','STSP','STTR','STVA','SYBA','SYBI','SYCA','SYLI','SYME','SYNT','SYST','TEEC','TENE','TEST',
  'TFLOW','THSY','TISP','TRFO','TRHU','TVLT','VAAE','VAPH','VARA','VASE','VASP','VASY','VAVA','VEBA','VECO','VEDY','VEIN','VEPA','VERE',
  'VESE','VEVO','VICE','VIGE','VIHE','VOCL','VRTX','ZECL','ZEDY','ZEEC','ZEFI','ZEMA','ZEPR','ZERE','ZESA','ZEST'
]);

const sectors = [
  {
    name: 'AI & Machine Learning',
    subIndustries: ['Generative LLM Infrastructure', 'Autonomous Agent Architectures', 'Neuromorphic Processors', 'Edge AI Acceleration', 'Vision Foundation Models', 'Synthetic Data Engines', 'AI Copilot Orchestration', 'Speech Neural Synthesis']
  },
  {
    name: 'CleanTech & Energy',
    subIndustries: ['Solid-State Lithium Storage', 'Magnetically Confined Fusion', 'Direct Atmospheric Carbon Capture', 'Green Hydrogen Electrolysis', 'Microgrid Autonomous Balancing', 'Next-Gen Perovskite Solar', 'Industrial Heat Decarbonization', 'Thermal Energy Batteries']
  },
  {
    name: 'Fintech & DeFi',
    subIndustries: ['Institutional RWA Tokenization', 'Zero-Knowledge Settlement Layer', 'Automated Liquidity Provisioning', 'Algorithmic Credit Scoring', 'Cross-Border Real-Time FX', 'Decentralized Identity Verification', 'Embedded Corporate Treasury', 'Digital Asset Custodial Security']
  },
  {
    name: 'Enterprise SaaS',
    subIndustries: ['Continuous Observability Mesh', 'Autonomous SecOps & Threat Defense', 'Zero-Trust API Gateway', 'Vector Database Systems', 'Quantum-Resilient Encryption', 'Collaborative Data Workspaces', 'Cloud Cost Autonomous Optimizer', 'DevOps Continuous Deployment Matrix']
  },
  {
    name: 'BioTech & Health',
    subIndustries: ['In-Silico Molecular Docking', 'CRISPR Gene Activation Therapeutics', 'Targeted Epigenetic Reprogramming', 'Synthetic mRNA Vaccines', 'Single-Cell Spatial Proteomics', 'Microbiome Oncology Therapeutics', 'Bioelectronic Neural Interfaces', 'AI-Driven Structural Virology']
  },
  {
    name: 'SpaceTech & Defense',
    subIndustries: ['Commercial Orbital Logistics', 'Autonomous Space Tug Servicing', 'Hypersonic Stratospheric Gliders', 'Laser Inter-Satellite Links', 'Lunar Resource Extraction Systems', 'Earth Observation Synthetic Aperture Radar', 'Reusable Orbital Launch Vehicles', 'Microgravity Material Manufacturing']
  },
  {
    name: 'Robotics & Automation',
    subIndustries: ['Bipedal Humanoid Industrial Robots', 'Autonomous Micro-Fulfillment Swarms', 'Subsea Robotic Inspection Drones', 'Precision Agricultural Cobots', 'Autonomous Heavy Mining Fleet', 'Robotic Surgical Microsystems', 'Aerial Infrastructure Inspection', 'Autonomous Forklift Operations']
  },
  {
    name: 'Quantum & Hardware',
    subIndustries: ['Topological Quantum Computing', 'Photonic Integrated Circuits', 'Cryogenic Control Nanocells', 'Superconducting Logic Processors', 'Graphene Thermal Dissipation', 'Gallium Nitride Power Semis', 'Quantum Key Distribution Networks', 'Extreme Ultraviolet Lithography Components']
  }
];

const headquarters = [
  { city: 'San Francisco, CA', region: 'North America' },
  { city: 'New York, NY', region: 'North America' },
  { city: 'Austin, TX', region: 'North America' },
  { city: 'Boston, MA', region: 'North America' },
  { city: 'Seattle, WA', region: 'North America' },
  { city: 'Palo Alto, CA', region: 'North America' },
  { city: 'San Diego, CA', region: 'North America' },
  { city: 'Boulder, CO', region: 'North America' },
  { city: 'London, UK', region: 'Europe' },
  { city: 'Zurich, Switzerland', region: 'Europe' },
  { city: 'Berlin, Germany', region: 'Europe' },
  { city: 'Paris, France', region: 'Europe' },
  { city: 'Stockholm, Sweden', region: 'Europe' },
  { city: 'Singapore', region: 'Asia-Pacific' },
  { city: 'Tokyo, Japan', region: 'Asia-Pacific' },
  { city: 'Sydney, Australia', region: 'Asia-Pacific' },
  { city: 'Tel Aviv, Israel', region: 'Middle East' },
  { city: 'Toronto, Canada', region: 'North America' }
];

const colors = [
  'bg-indigo-600', 'bg-purple-600', 'bg-blue-600', 'bg-emerald-600',
  'bg-cyan-600', 'bg-teal-600', 'bg-rose-600', 'bg-amber-600',
  'bg-violet-600', 'bg-sky-600', 'bg-orange-600', 'bg-fuchsia-600'
];

const ceoFirst = ['Alexander', 'Elena', 'Marcus', 'Sophia', 'Julian', 'Claire', 'Tariq', 'Naomi', 'Vikram', 'Seraphina', 'Dante', 'Astrid', 'Harrison', 'Leila', 'Kaelen', 'Mira', 'Zane', 'Ronan', 'Maya', 'Cassian', 'Siddharth', 'Theron', 'Kira', 'Lucas', 'Arjun', 'Valerie', 'Gideon', 'Noor'];
const ceoLast = ['Vance', 'Sterling', 'Chen', 'Lindqvist', 'Nakamura', 'O\'Connor', 'Al-Mansoor', 'Mercer', 'Patel', 'Kovacs', 'Sinclair', 'Thorne', 'Holt', 'Rousseau', 'Winter', 'Ashford', 'Cross', 'Montgomery', 'Zhao', 'Vasiliev', 'Gallagher', 'Locke', 'Fontaine', 'Morales'];

// 250 curated distinct startup company names & short names
const ventureNameBases = [
  ["Aetheris AI", "Aetheris AI Systems, Inc."],
  ["Vortex Fusion", "Vortex Fusion Energy Corp."],
  ["HyperScale Quantum", "HyperScale Quantum Labs, Inc."],
  ["Chronos Robotics", "Chronos Robotics Technologies, Inc."],
  ["Synapse BioWorks", "Synapse BioWorks Therapeutics, Inc."],
  ["Orbital Dynamics", "Orbital Dynamics Aerospace Corp."],
  ["Zephyr CleanTech", "Zephyr CleanTech Systems, Inc."],
  ["Prism SecOps", "Prism SecOps Platform, Inc."],
  ["Nexus Layer", "Nexus Layer Protocols, Inc."],
  ["Krypton Compute", "Krypton Compute Architectures, Inc."],
  ["Helios Solar", "Helios Advanced Photovoltaics, Inc."],
  ["Apex BioSciences", "Apex Synthetic BioSciences, Inc."],
  ["Lumina Vision", "Lumina Neural Vision Systems, Inc."],
  ["Strata Geological", "Strata Subsurface CleanTech, Inc."],
  ["CyberMesh Defense", "CyberMesh Autonomous Defense Corp."],
  ["Quantix Logic", "Quantix Logic Microdevices, Inc."],
  ["Voltix Storage", "Voltix Solid-State Battery Corp."],
  ["DeepMinded AI", "DeepMinded Cognitive Systems, Inc."],
  ["Astral Spacecraft", "Astral Spacecraft Engineering Corp."],
  ["TheraGenetics", "TheraGenetics Precision Medicine, Inc."],
  ["Cobalt Robotics", "Cobalt Autonomous Systems, Inc."],
  ["Flux Energy", "Flux Thermal Storage, Inc."],
  ["BlockMatrix", "BlockMatrix Clearing Systems, Inc."],
  ["OmniVector", "OmniVector Database Technologies, Inc."],
  ["Solaria Grid", "Solaria Autonomous Microgrids, Inc."],
  ["NeuroPulse", "NeuroPulse Neural Interfaces, Inc."],
  ["Titan Launch", "Titan Orbital Heavy Launch Corp."],
  ["Spectra Sensors", "Spectra Quantum Sensing, Inc."],
  ["BioCellular", "BioCellular Regenerative Technologies, Inc."],
  ["IronClad Cyber", "IronClad Zero-Trust Infrastructure, Inc."],
  ["AeroSwift", "AeroSwift Hypersonic Logistics, Inc."],
  ["CryoTech Quantum", "CryoTech Quantum Cooling Corp."],
  ["Veritas Protocol", "Veritas Institutional Ledger, Inc."],
  ["Aether Carbon", "Aether Direct Air Capture Corp."],
  ["Cognitive Swarm", "Cognitive Swarm Automation, Inc."],
  ["Genomic Vector", "Genomic Vector Therapeutics, Inc."],
  ["Starlight Interconnect", "Starlight Optical Interconnects, Inc."],
  ["HydraFuel", "HydraFuel Hydrogen Systems Corp."],
  ["Vanguard Defense", "Vanguard Autonomous Shield, Inc."],
  ["Quantum Silicon", "Quantum Silicon Foundry, Inc."],
  ["Centauri Space", "Centauri Deep Space Communications Corp."],
  ["BioSynthetix", "BioSynthetix Protein Engineering, Inc."],
  ["Apex Autonomous", "Apex Heavy Robotic Systems, Inc."],
  ["Polaris Fusion", "Polaris Magneto-Inertial Fusion, Inc."],
  ["Sentient Cloud", "Sentient Distributed Compute, Inc."],
  ["Terraform Clean", "Terraform Industrial Decarbonization Corp."],
  ["NeuroLinker", "NeuroLinker Brain-Computer Interfaces, Inc."],
  ["ZeroKey Crypto", "ZeroKey Cryptographic Systems, Inc."],
  ["Orbital Tether", "Orbital Tether Space Logistics Corp."],
  ["Cellular Dynamix", "Cellular Dynamix Oncology, Inc."],
  ["Argus Satellite", "Argus Radar Constellations, Inc."],
  ["Verdant Energy", "Verdant Geothermal Technologies, Inc."],
  ["OmniRobotics", "OmniRobotics Warehouse Swarms, Inc."],
  ["Pinnacle Micro", "Pinnacle Micro Semiconductor Corp."],
  ["Aegis BioDefense", "Aegis BioDefense Systems, Inc."],
  ["Quasar Photonics", "Quasar Integrated Photonics, Inc."],
  ["ExoFleet", "ExoFleet Autonomous Maritime, Inc."],
  ["Helium Core", "Helium Core Fusion Power, Inc."],
  ["Synthetica AI", "Synthetica Cognitive Agentics, Inc."],
  ["NanoMatrix", "NanoMatrix Advanced Materials, Inc."],
  ["AeroDynamics X", "AeroDynamics X Flight Technologies, Inc."],
  ["BioLogic Reprogram", "BioLogic Epigenetic Reprogramming, Inc."],
  ["Kinetix Motors", "Kinetix Superconducting Actuators, Inc."],
  ["Banyan Cloud", "Banyan Autonomous Cloud Fabric, Inc."],
  ["Oasis Desal", "Oasis Clean Water Nanofiltration, Inc."],
  ["PulseWave Health", "PulseWave Non-Invasive Diagnostics, Inc."],
  ["Orbitron Dynamics", "Orbitron In-Space Propulsion, Inc."],
  ["TensorFlow Systems", "TensorFlow Accelerated Silicon, Inc."],
  ["GreenVolt Power", "GreenVolt Grid Storage, Inc."],
  ["ShieldX Cyber", "ShieldX Autonomous Endpoint Defense, Inc."],
  ["NeuroGlia Labs", "NeuroGlia Central Nervous Therapeutics, Inc."],
  ["AeroStratix", "AeroStratix High-Altitude Platforms, Inc."],
  ["Metis Algorithmic", "Metis Algorithmic Treasury, Inc."],
  ["Subsea Robotics", "Subsea Autonomous Robotic Fleet, Inc."],
  ["TheraWave Bio", "TheraWave Targeted Ultrasound, Inc."],
  ["HyperLight Laser", "HyperLight Free-Space Optical, Inc."],
  ["EnviroCarbon", "EnviroCarbon Mineralization, Inc."],
  ["CogniForge", "CogniForge Foundation Model Systems, Inc."],
  ["Apex BioLogic", "Apex Biomanufacturing Platforms, Inc."],
  ["TerraPower Gen", "TerraPower Molten Salt Technologies, Inc."],
  ["Vesper Cyber", "Vesper Threat Intelligence Corp."],
  ["Skyward Launch", "Skyward Micro-Launcher Corp."],
  ["ExaScale Compute", "ExaScale Clustered Architecture, Inc."],
  ["Nautilus Ocean", "Nautilus Ocean Thermal Energy Corp."],
  ["InSilico Therapeutics", "InSilico AI Drug Design, Inc."],
  ["AuraRobotics", "AuraRobotics Surgical Cobots, Inc."],
  ["Graphite Nano", "Graphite Nanomaterial Solutions, Inc."],
  ["Zephyr Stratos", "Zephyr Stratospheric Logistics, Inc."],
  ["Lumiere Solar", "Lumiere Ultra-High Efficiency Solar, Inc."],
  ["Aegis Zero", "Aegis Zero-Knowledge Cryptography, Inc."],
  ["NeuroTarget", "NeuroTarget Precision Neuromodulation, Inc."],
  ["CryoCell Bio", "CryoCell Organ Preservation Systems, Inc."],
  ["Triton Submersible", "Triton Autonomous Ocean Explorers, Inc."],
  ["FluxCapacitor", "FluxCapacitor High-Density Supercapacitors, Inc."],
  ["OmniChain RWA", "OmniChain Real-World Asset Protocol, Inc."],
  ["AeroGlide Space", "AeroGlide Re-entry Systems, Inc."],
  ["BioResonance", "BioResonance Targeted Therapeutics, Inc."],
  ["Apex Quantum", "Apex Quantum Superconductors, Inc."],
  ["SynthiGen AI", "SynthiGen Synthetic Biological Models, Inc."],
  ["EcoHarvest Clean", "EcoHarvest Agritech Decarbonization, Inc."],
  ["Veritas Cloud", "Veritas Confidential Computing, Inc."],
  ["NeuroSurgix", "NeuroSurgix Robotic Microsurgery, Inc."],
  ["OrbitGuard", "OrbitGuard Space Debris Remediation Corp."],
  ["Veloce AI", "Veloce Real-Time Edge Processing, Inc."],
  ["Hydrogenix Core", "Hydrogenix Solid-Oxide Hydrogen, Inc."],
  ["Sentinel Shield", "Sentinel Cyber Resilience Corp."],
  ["BioForge RNA", "BioForge Targeted RNA Therapies, Inc."],
  ["Krypton Labs", "Krypton Low-Latency Financial Tech, Inc."],
  ["Solaris Space", "Solaris Space-Based Solar Power Corp."],
  ["RoboAgri Tech", "RoboAgri Autonomous Farming Fleets, Inc."],
  ["DeepOcean Minerals", "DeepOcean Clean Mineral Extraction, Inc."],
  ["QuantumBridge", "QuantumBridge Entanglement Routers, Inc."],
  ["NeuroGenesis Bio", "NeuroGenesis Brain Repair Therapeutics, Inc."],
  ["HyperLoop Logistics", "HyperLoop Pneumatic Freight Logistics, Inc."],
  ["CleanWatt Power", "CleanWatt Industrial Heat Recovery, Inc."],
  ["Fortress Vault", "Fortress Institutional Digital Custody, Inc."],
  ["AeroDrone X", "AeroDrone Autonomous Freight Delivery, Inc."],
  ["ProteoForm Bio", "ProteoForm Protein Degradation, Inc."],
  ["OptiRoute AI", "OptiRoute Autonomous Supply Chain, Inc."],
  ["CarbonVault", "CarbonVault Permanent Subsurface Sequestration, Inc."],
  ["Apex BioSensing", "Apex Nanopore Molecular Biosensors, Inc."],
  ["StarForge Space", "StarForge Off-World Manufacturing Corp."],
  ["NeuraVision", "NeuraVision Retinal Implant Systems, Inc."],
  ["ZeroPoint Energy", "ZeroPoint Vacuum Energy Exploration, Inc."],
  ["SecureNet Mesh", "SecureNet Mesh Cryptographic Networks, Inc."],
  ["OmniBio Dynamics", "OmniBio Precision Oncology Diagnostics, Inc."],
  ["SkyLink Orbit", "SkyLink Mega-Constellation Services, Inc."],
  ["QuantumWave", "QuantumWave Acoustic Wave Processors, Inc."],
  ["GreenStream Fuel", "GreenStream Bio-Sustainable Aviation Fuel, Inc."],
  ["CyberForge", "CyberForge Automated Firmware Defense, Inc."],
  ["BioPrint Solutions", "BioPrint 3D Organ Bioprinting, Inc."],
  ["RoboLogix", "RoboLogix Autonomous Yard Tractors, Inc."],
  ["HelioVolt Storage", "HelioVolt Zinc-Air Long-Duration Storage, Inc."],
  ["AlphaAgent AI", "AlphaAgent Autonomous Enterprise Co-Workers, Inc."],
  ["Orbital Foundry", "Orbital Foundry In-Orbit Metallurgy, Inc."],
  ["GeneCraft Bio", "GeneCraft Precision Base Editing, Inc."],
  ["TerraSensor Clean", "TerraSensor Hyperspectral Earth Observation, Inc."],
  ["Aegis Quantum", "Aegis Quantum Cryptographic Hardware, Inc."],
  ["DeepSea Power", "DeepSea Tidal Current Generators, Inc."],
  ["NeuroVascular Tech", "NeuroVascular Catheter Robotics, Inc."],
  ["AeroSpacecraft Inc", "AeroSpacecraft Orbital Servicing Corp."],
  ["Synthetix Bio", "Synthetix Engineered Microbiome, Inc."],
  ["Voltaic Power", "Voltaic High-Voltage Power Semiconductors, Inc."],
  ["CloudSentinel", "CloudSentinel Cloud Identity Threat Detection, Inc."],
  ["ExoRobotics", "ExoRobotics Exoskeleton Assistive Technologies, Inc."],
  ["MicroBio Gen", "MicroBio Gen Agricultural Biologics, Inc."],
  ["SpaceFreight", "SpaceFreight Suborbital Rapid Transport Corp."],
  ["QuantumCore Logic", "QuantumCore Cryogenic CMOS Systems, Inc."],
  ["EnviroThermal", "EnviroThermal Geothermal Heat Engines, Inc."],
  ["LedgerZero", "LedgerZero Zero-Knowledge Institutional Auditing, Inc."],
  ["NeuroSense Labs", "NeuroSense Cognitive Neuromarkers, Inc."],
  ["Apex Aerospace", "Apex Aerospace Composite Aero-Structures, Inc."],
  ["BioMetrix Health", "BioMetrix Continuous Molecular Monitoring, Inc."],
  ["HyperSpectral AI", "HyperSpectral Satellite Analytics, Inc."],
  ["CleanCycle Water", "CleanCycle Wastewater Resource Recovery, Inc."],
  ["CypherLock Cyber", "CypherLock Quantum-Safe Key Generation, Inc."],
  ["RoboCrane Dynamics", "RoboCrane Autonomous Construction Robotics, Inc."],
  ["Solaris Fusion", "Solaris Stellarator Fusion Reactors, Inc."],
  ["CognitiveEdge AI", "CognitiveEdge Neuromorphic Video Processors, Inc."],
  ["StarNet Space", "StarNet Interplanetary Relay Infrastructure Corp."],
  ["GeneMatrix Bio", "GeneMatrix Allogeneic Cell Therapies, Inc."],
  ["TerraVolt Energy", "TerraVolt Flow Battery Solutions, Inc."],
  ["OmniSecurity", "OmniSecurity Autonomous Deception Systems, Inc."],
  ["BioResilient", "BioResilient Cellular Senescence Reversal, Inc."],
  ["AeroPulse Engines", "AeroPulse Rotating Detonation Engines, Inc."],
  ["QuantumSensing", "QuantumSensing Diamond Nitrogen-Vacancy Devices, Inc."],
  ["GreenIron Decarb", "GreenIron Direct Reduced Hydrogen Iron Corp."],
  ["BitShield Crypto", "BitShield Multi-Party Computation Treasury, Inc."],
  ["NeuroCraft Health", "NeuroCraft Stroke Intervention Devices, Inc."],
  ["SkyCargo Transit", "SkyCargo Heavy Lift Drone Airships, Inc."],
  ["BioMolecular AI", "BioMolecular Generative Molecular Structures, Inc."],
  ["RoboFarm Swarm", "RoboFarm Autonomous Weeding and Harvesting, Inc."],
  ["EcoBattery Tech", "EcoBattery Sodium-Ion Industrial Cells, Inc."],
  ["AgenticOps AI", "AgenticOps Autonomous Business Workflow, Inc."],
  ["AstroMinerals", "AstroMinerals Near-Earth Asteroid Prospecting Corp."],
  ["CellRepair Bio", "CellRepair Mitochondrial Replacement, Inc."],
  ["TerraBio Clean", "TerraBio Bioplastic Polymer Synthesis, Inc."],
  ["CipherShield", "CipherShield Post-Quantum Communication Suites, Inc."],
  ["NeuroOptix", "NeuroOptix Optogenetic Neural Control, Inc."],
  ["Apex Propulsion", "Apex Propulsion Hall-Effect Thrusters, Inc."],
  ["BioSynth Protein", "BioSynth De Novo Enzyme Design, Inc."],
  ["PowerMesh Energy", "PowerMesh Solid-State Grid Transformers, Inc."],
  ["SecOps Engine", "SecOps Engine Automated Penetration Testing, Inc."],
  ["RoboMarine", "RoboMarine Autonomous Cargo Vessels, Inc."],
  ["QuantumOptics", "QuantumOptics Single-Photon Sources, Inc."],
  ["CleanSky Aviation", "CleanSky Hybrid Electric Commuter Aircraft, Inc."],
  ["TrustVault Crypto", "TrustVault Decentralized Settlement Rails, Inc."],
  ["NeuroPath Bio", "NeuroPath Amyotrophic Lateral Sclerosis Therapies, Inc."],
  ["OrbitHub Stations", "OrbitHub Commercial Space Station Modules Corp."],
  ["BioImmune Logic", "BioImmune Logic Synthetic T-Cell Receptors, Inc."],
  ["HydroFlow Tech", "HydroFlow Advanced Alkaline Water Electrolyzers, Inc."],
  ["Apex CyberOps", "Apex CyberOps Autonomous Threat Hunters, Inc."],
  ["RoboMiner Heavy", "RoboMiner Underground Autonomous Excavators, Inc."],
  ["SunPower Cell", "SunPower Tandem Silicon-Perovskite Cells, Inc."],
  ["VectorForge AI", "VectorForge Hardware Accelerated Embedding, Inc."],
  ["AeroLander Space", "AeroLander Autonomous Planetary Descent Systems, Inc."],
  ["GenomicHealth AI", "GenomicHealth Polygenic Risk Stratification, Inc."],
  ["TerraCarbon Tech", "TerraCarbon Biochar Carbon Removal, Inc."],
  ["ZeroTrace Cyber", "ZeroTrace Anonymized Hardware Enclaves, Inc."],
  ["NeuroPulse Bio", "NeuroPulse Non-Invasive Vagus Stimulation, Inc."],
  ["AeroWave Aero", "AeroWave Blended Wing Body Transport, Inc."],
  ["BioNano Therapeutics", "BioNano Targeted Nanomedicine Particles, Inc."],
  ["SmartGrid Storage", "SmartGrid Iron-Air Multi-Day Energy Storage, Inc."],
  ["FinEdge Protocols", "FinEdge Automated Market Maker Infrastructures, Inc."],
  ["RoboDelivery Swarm", "RoboDelivery Swarm Sidewalk Delivery Fleet, Inc."],
  ["QuantumCompute X", "QuantumCompute X Neutral Atom Processors, Inc."],
  ["GreenAmmonia Fuel", "GreenAmmonia Zero-Carbon Maritime Fuel, Inc."],
  ["CloudShield Sec", "CloudShield Cloud-Native Application Protection, Inc."],
  ["NeuroVibe Labs", "NeuroVibe Acoustic Neuromodulation, Inc."],
  ["SkySat Imaging", "SkySat Imaging High-Revisit Orbiters Corp."],
  ["BioSynthesize", "BioSynthesize Scalable Fermentation Platforms, Inc."],
  ["VoltMatrix Power", "VoltMatrix High-Density Power Electronics, Inc."],
  ["Apex AI Robotics", "Apex AI Robotics Vision-Language-Action Models, Inc."],
  ["CleanCement Tech", "CleanCement Carbon-Negative Supplementary Cement, Inc."],
  ["SafeVault Ledger", "SafeVault Ledger Provable Sovereign Cryptography, Inc."],
  ["NeuroFlex Bio", "NeuroFlex Flexible Bio-Implantable Electronics, Inc."],
  ["AeroRocketry Corp", "AeroRocketry Autonomous Orbital Boosters, Inc."],
  ["BioTherapy Group", "BioTherapy Group Engineered Macrophage Oncology, Inc."],
  ["HydroVolt Energy", "HydroVolt Flow Battery Storage Systems, Inc."],
  ["SentinelMesh", "SentinelMesh Distributed Firewall Automations, Inc."],
  ["RoboFlight Swarms", "RoboFlight Swarms Autonomous Drone Inspection, Inc."],
  ["QuantumSensor Tech", "QuantumSensor Tech Quantum Gravimeters, Inc."],
  ["EcoFuel Dynamics", "EcoFuel Dynamics Synthetic Hydrocarbon Syngas, Inc."],
  ["CoinMetrics Vault", "CoinMetrics Vault Institutional Settlement Protocols, Inc."],
  ["NeuroCure Health", "NeuroCure Health Neurodegenerative Gene Therapy, Inc."],
  ["OrbitalSolar Corp", "OrbitalSolar Space Solar Microwave Beaming Corp."],
  ["BioPharma Logic", "BioPharma Logic Computational Antibody Discovery, Inc."],
  ["ThermalPower Tech", "ThermalPower Low-Grade Heat-to-Power Engines, Inc."],
  ["Apex SecNet", "Apex SecNet Micro-Segmented Zero Trust, Inc."],
  ["RoboFactory Systems", "RoboFactory Systems Lights-Out Assembly Automations, Inc."],
  ["QuantumLogic Labs", "QuantumLogic Labs Silicon Spin Qubits, Inc."],
  ["CleanH2 Generation", "CleanH2 Generation Thermochemical Water Splitting, Inc."],
  ["AlphaLedger Corp", "AlphaLedger High-Throughput Settlement Networks, Inc."],
  ["NeuroSpine Bio", "NeuroSpine Spinal Cord Regeneration Scaffolds, Inc."],
  ["SkyPort Stations", "SkyPort Stations Autonomous eVTOL Vertiports, Inc."],
  ["BioVax Synthetics", "BioVax Synthetics Self-Amplifying RNA Platforms, Inc."],
  ["EcoGrid Energy", "EcoGrid Energy Virtual Power Plant Orchestration, Inc."],
  ["SecureMesh Cloud", "SecureMesh Cloud Confidential Multi-Cloud Routers, Inc."],
  ["RoboInspect Swarm", "RoboInspect Swarm Pipeline Ultrasonic Crawlers, Inc."],
  ["QuantumDot Semi", "QuantumDot Semi Colloidal Quantum Dot Infrared, Inc."],
  ["GreenSteel Decarb", "GreenSteel Direct Electrowinning Iron Corp."],
  ["Veritas Ledger", "Veritas Ledger Cryptographically Verifiable Audit Logs, Inc."],
  ["NeuroCellular Bio", "NeuroCellular Bio Autologous Cell Therapies, Inc."],
  ["AeroSpace Launch", "AeroSpace Launch Reusable Second-Stage Recovery, Inc."],
  ["BioMolecular Gen", "BioMolecular Gen High-Throughput Oligonucleotide, Inc."],
  ["PowerCell Storage", "PowerCell Storage Solid-Electrolyte Separator Corp."],
  ["DataShield AI", "DataShield AI Homomorphic Encryption Co-Processors, Inc."],
  ["RoboAg Swarms", "RoboAg Swarms Targeted Micro-Spraying Robotics, Inc."],
  ["QuantumFoundry Inc", "QuantumFoundry Cryogenic Packaging Platforms, Inc."],
  ["CleanGas Carbon", "CleanGas Carbon Methane Pyrolysis Technologies, Inc."],
  ["Apex Liquidity", "Apex Liquidity Institutional Cross-DEX Aggregators, Inc."],
  ["NeuroHealth Labs", "NeuroHealth Labs Non-Invasive EEG Cognitive Monitoring, Inc."],
  ["AeroOrbit Space", "AeroOrbit Space Autonomous Satellite Relocation, Inc."],
  ["BioActive Therapeutics", "BioActive Therapeutics Cyclic Peptide Therapeutics, Inc."],
  ["TerraVolt Batteries", "TerraVolt Batteries Zinc-Manganese Grid Energy, Inc."],
  ["CloudGuard Sec", "CloudGuard Sec Autonomous Cloud Forensics, Inc."],
  ["RoboSort Logistics", "RoboSort Logistics High-Speed Induction Parcel Sort, Inc."],
  ["QuantumBit Systems", "QuantumBit Systems Trapped Ion Quantum Computers, Inc."],
  ["EcoClean Bio", "EcoClean Bio Enzymatic Plastic Depolymerization, Inc."],
  ["PrimeSettlement", "PrimeSettlement Real-Time Gross Institutional Settlement, Inc."],
  ["NeuroSynapse Health", "NeuroSynapse Health Synaptic Plasticity Restorers, Inc."],
  ["SkyRocketry Space", "SkyRocketry Space Additive-Manufactured Rocket Motors, Inc."],
  ["BioGenomix Tech", "BioGenomix Tech Next-Generation Long-Read Sequencing, Inc."],
  ["SolidState Energy", "SolidState Energy Ceramic Electrolyte Battery Packs, Inc."],
  ["Apex ZeroTrust", "Apex ZeroTrust Cryptographic Identity Perimeters, Inc."],
  ["RoboClean Swarms", "RoboClean Swarms Autonomous Solar Farm Washers, Inc."]
];

// Generate unique tickers for each of the 250
const assignedTickers = new Set();

function generateTicker(name, index) {
  // Strip non-alpha, take first 4-5 chars
  let clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
  let candidate = clean.slice(0, 4);
  if (candidate.length < 3) candidate = (clean + 'XX').slice(0, 4);
  
  // Try candidate
  if (!existingCompanyTickers.has(candidate) && !assignedTickers.has(candidate)) {
    assignedTickers.add(candidate);
    return candidate;
  }
  
  // Try 5-letter
  if (clean.length >= 5) {
    let c5 = clean.slice(0, 5);
    if (!existingCompanyTickers.has(c5) && !assignedTickers.has(c5)) {
      assignedTickers.add(c5);
      return c5;
    }
  }

  // Try prefixes like V + 3 letters
  let vCandidate = 'V' + clean.slice(0, 3);
  if (!existingCompanyTickers.has(vCandidate) && !assignedTickers.has(vCandidate)) {
    assignedTickers.add(vCandidate);
    return vCandidate;
  }

  // Fallback to systematic venture tickers: VN001 - VN250
  let numStr = String(index + 1).padStart(3, '0');
  let fallback = 'VN' + numStr;
  assignedTickers.add(fallback);
  return fallback;
}

const rounds = ['Series Seed', 'Series A', 'Series A+', 'Series B', 'Series B+', 'Series C', 'Series D', 'Growth Capital', 'Pre-IPO Growth'];
const securityTypes = [
  'Series A Preferred Stock',
  'Series B Preferred Equity',
  'Convertible Equity SAFE',
  'Senior Preferred Growth Shares',
  'Series Seed Preferred Stock',
  'Series C Preferred Participating'
];

const fundingPurposes = [
  'Scaling deep-tech engineering talent, accelerating pilot trials, and expanding regulatory filing submissions.',
  'Scaling enterprise go-to-market teams across North America and Europe while deploying tier-1 compute cluster infrastructure.',
  'Commercial production ramp-up, ISO-9001 factory qualification, and tier-1 institutional customer deployments.',
  'Accelerating clinical trial phases, scaling automated synthesis lines, and securing global intellectual property patents.',
  'Expanding orbital payload capacity, commissioning dedicated ground stations, and delivering next-gen constellation hardware.',
  'Deploying nationwide autonomous hardware fleets, setting up regional maintenance hubs, and securing municipal operating permits.',
  'Constructing gigawatt-scale manufacturing facilities, securing raw material supply chains, and commissioning automated assembly lines.'
];

console.log('Generating 250 ventures...');

const ventures = [];
const metrics = [];

for (let i = 0; i < 250; i++) {
  const indexNum = i + 1;
  const id = `00000000-0000-0000-0002-${String(indexNum).padStart(12, '0')}`;
  const metricId = `00000000-0000-0000-0003-${String(indexNum).padStart(12, '0')}`;
  const cik = `CIK-0004${String(indexNum).padStart(6, '0')}`;

  const [shortName, fullName] = ventureNameBases[i % ventureNameBases.length];
  // Adjust if index >= length to make unique
  const finalShortName = i < ventureNameBases.length ? shortName : `${shortName} ${Math.floor(i / ventureNameBases.length) + 1}`;
  const finalFullName = i < ventureNameBases.length ? fullName : `${fullName.replace(', Inc.', '')} Group ${Math.floor(i / ventureNameBases.length) + 1}, Inc.`;

  const ticker = generateTicker(finalShortName, i);
  const sectorObj = sectors[i % sectors.length];
  const sector = sectorObj.name;
  const subIndustry = sectorObj.subIndustries[i % sectorObj.subIndustries.length];
  
  const hq = headquarters[i % headquarters.length];
  const color = colors[i % colors.length];
  
  const foundedYear = 2019 + (i % 6); // 2019 - 2024
  const ceo = `${ceoFirst[i % ceoFirst.length]} ${ceoLast[(i * 3 + 5) % ceoLast.length]}`;
  const employees = 15 + ((i * 17) % 380);

  // Valuation: $15M to $850M
  const valMil = 15 + ((i * 37) % 835);
  const valuation = `$${valMil}.0M`;
  const valuationNum = valMil * 1000000;

  // Annual Revenue: $1.2M to $65M
  const revMil = (1.2 + ((i * 7) % 62)).toFixed(1);
  const annualRevenue = `$${revMil}M`;
  const annualRevenueNum = parseFloat(revMil) * 1000000;

  // Verification & Trust
  const verificationLevel = i % 10 === 0 ? 'SILVER' : (i % 3 === 0 ? 'PLATINUM' : 'GOLD');
  const trustScore = 80 + (i % 19); // 80 - 98

  // Round info
  const roundType = rounds[i % rounds.length];
  const targetRaiseMil = 5 + ((i * 11) % 75);
  const targetRaise = `$${targetRaiseMil}.0M`;
  const targetRaiseNum = targetRaiseMil * 1000000;

  // Raised amount: 35% to 94%
  const fundedPct = 35 + ((i * 13) % 60);
  const raisedMil = ((targetRaiseMil * fundedPct) / 100).toFixed(1);
  const raisedAmount = `$${raisedMil}M`;
  const raisedAmountNum = parseFloat(raisedMil) * 1000000;

  // Min investment
  const minInvestments = [5000, 10000, 25000, 50000, 100000];
  const minInvestNum = minInvestments[i % minInvestments.length];
  const minInvestment = `$${minInvestNum.toLocaleString()}`;

  const securityType = securityTypes[i % securityTypes.length];
  const fundingPurpose = fundingPurposes[i % fundingPurposes.length];
  const description = `${finalFullName} is a pioneering ${subIndustry.toLowerCase()} enterprise developing scalable next-generation systems. The company operates from ${hq.city} under Delaware jurisdiction and is raising its ${roundType} institutional financing round.`;

  // Market Metrics
  // Change percent: from -12.5% to +34.5%
  // Alternate gainers and losers
  const changeRaw = ((((i * 23) % 470) - 125) / 10).toFixed(1);
  const changePercent = parseFloat(changeRaw);
  const isPositive = changePercent >= 0;
  const change24h = (isPositive ? '+' : '') + changePercent + '%';

  const gainLossMil = ((valMil * Math.abs(changePercent)) / 100).toFixed(1);
  const marketCapGainLoss = (isPositive ? '+$' : '-$') + gainLossMil + 'M';

  const investedTodayNum = 50000 + ((i * 61000) % 2450000);
  const investedToday = investedTodayNum >= 1000000 
    ? `$${(investedTodayNum / 1000000).toFixed(2)}M` 
    : `$${(investedTodayNum / 1000).toFixed(0)}K`;

  const volumeNum = 200000 + ((i * 113000) % 5800000);
  const tradingVolumeToday = volumeNum >= 1000000
    ? `$${(volumeNum / 1000000).toFixed(2)}M`
    : `$${(volumeNum / 1000).toFixed(0)}K`;

  const is52wHigh = changePercent > 18.0;

  ventures.push({
    id,
    ticker,
    name: finalFullName,
    short_name: finalShortName,
    legal_entity: 'Delaware C-Corp',
    cik,
    sector,
    sub_industry: subIndustry,
    headquarters: hq.city,
    region: hq.region,
    founded_year: foundedYear,
    ceo,
    employees,
    valuation,
    valuation_num: valuationNum,
    annual_revenue: annualRevenue,
    annual_revenue_num: annualRevenueNum,
    verification_level: verificationLevel,
    trust_score: trustScore,
    description,
    logo_color: color,
    status: 'Active Trading',
    exchange_tier: 'Venture Growth Tier',
    round_type: roundType,
    target_raise: targetRaise,
    target_raise_num: targetRaiseNum,
    raised_amount: raisedAmount,
    raised_amount_num: raisedAmountNum,
    min_investment: minInvestment,
    min_investment_num: minInvestNum,
    funding_purpose: fundingPurpose,
    security_type: securityType
  });

  metrics.push({
    id: metricId,
    venture_id: id,
    change_24h: change24h,
    change_percent: changePercent,
    is_positive: isPositive,
    market_cap_gain_loss: marketCapGainLoss,
    invested_today: investedToday,
    invested_today_num: investedTodayNum,
    allocation_percent: fundedPct,
    trading_volume_today: tradingVolumeToday,
    trading_volume_num: volumeNum,
    is_52w_high: is52wHigh
  });
}

// Compute top 10 rankings for market metrics
// 1. Top gainers (highest positive change_percent)
const sortedGainers = [...metrics].filter(m => m.change_percent > 0).sort((a, b) => b.change_percent - a.change_percent);
for (let r = 0; r < Math.min(10, sortedGainers.length); r++) {
  sortedGainers[r].rank_gainer = r + 1;
}

// 2. Top losers (most negative change_percent)
const sortedLosers = [...metrics].filter(m => m.change_percent < 0).sort((a, b) => a.change_percent - b.change_percent);
for (let r = 0; r < Math.min(10, sortedLosers.length); r++) {
  sortedLosers[r].rank_loser = r + 1;
}

// 3. Most invested today
const sortedMostInvested = [...metrics].sort((a, b) => b.invested_today_num - a.invested_today_num);
for (let r = 0; r < 10; r++) {
  sortedMostInvested[r].rank_most_invested = r + 1;
}

// 4. Least invested today
const sortedLeastInvested = [...metrics].sort((a, b) => a.invested_today_num - b.invested_today_num);
for (let r = 0; r < 10; r++) {
  sortedLeastInvested[r].rank_least_invested = r + 1;
}

// 5. Most active (highest trading volume)
const sortedMostActive = [...metrics].sort((a, b) => b.trading_volume_num - a.trading_volume_num);
for (let r = 0; r < 10; r++) {
  sortedMostActive[r].rank_most_active = r + 1;
}

// 6. 52w highs
const sorted52w = [...metrics].filter(m => m.is_52w_high).sort((a, b) => b.change_percent - a.change_percent);
for (let r = 0; r < Math.min(10, sorted52w.length); r++) {
  sorted52w[r].rank_52w_high = r + 1;
}

// 7. Recently viewed (first 10)
for (let r = 0; r < 10; r++) {
  metrics[r].rank_recently_viewed = r + 1;
}

console.log(`Generated ${ventures.length} ventures. Checking uniqueness...`);
const uniqueTickers = new Set(ventures.map(v => v.ticker));
console.log(`Unique tickers: ${uniqueTickers.size} / 250`);
if (uniqueTickers.size !== 250) {
  throw new Error('Duplicate tickers found!');
}

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

// Generate SQL Migration script V10
let sql = `-- White Quantex v2 — Venture Capital & Start-up Registry Schema & 250 Seed Ventures
-- Migration: V10__ventures_schema_and_seed_250.sql
-- Compatible with PostgreSQL and H2 databases

CREATE TABLE IF NOT EXISTS ventures (
    id UUID PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    legal_entity VARCHAR(150) NOT NULL DEFAULT 'Delaware C-Corp',
    cik VARCHAR(50) NOT NULL UNIQUE,
    sector VARCHAR(100) NOT NULL,
    sub_industry VARCHAR(150) NOT NULL,
    headquarters VARCHAR(150) NOT NULL,
    region VARCHAR(50) NOT NULL,
    founded_year INT NOT NULL,
    ceo VARCHAR(150) NOT NULL,
    employees INT NOT NULL DEFAULT 1,
    valuation VARCHAR(50) NOT NULL,
    valuation_num NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    annual_revenue VARCHAR(50) NOT NULL,
    annual_revenue_num NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    verification_level VARCHAR(50) NOT NULL DEFAULT 'GOLD',
    trust_score INT NOT NULL DEFAULT 85,
    description TEXT,
    logo_color VARCHAR(50) NOT NULL DEFAULT 'bg-indigo-600',
    status VARCHAR(50) NOT NULL DEFAULT 'Active Trading',
    exchange_tier VARCHAR(50) NOT NULL DEFAULT 'Venture Growth Tier',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    round_type VARCHAR(50) NOT NULL DEFAULT 'Series A',
    target_raise VARCHAR(50) NOT NULL DEFAULT '$15.0M',
    target_raise_num NUMERIC(18, 2) NOT NULL DEFAULT 15000000.00,
    raised_amount VARCHAR(50) NOT NULL DEFAULT '$8.5M',
    raised_amount_num NUMERIC(18, 2) NOT NULL DEFAULT 8500000.00,
    min_investment VARCHAR(50) NOT NULL DEFAULT '$25,000',
    min_investment_num NUMERIC(18, 2) NOT NULL DEFAULT 25000.00,
    funding_purpose TEXT,
    security_type VARCHAR(100) NOT NULL DEFAULT 'Series A Preferred Stock',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS venture_market_metrics (
    id UUID PRIMARY KEY,
    venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    change_24h VARCHAR(20) NOT NULL DEFAULT '0.0%',
    change_percent NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    is_positive BOOLEAN NOT NULL DEFAULT TRUE,
    market_cap_gain_loss VARCHAR(50),
    invested_today VARCHAR(50),
    allocation_percent INT,
    trading_volume_today VARCHAR(50),
    is_52w_high BOOLEAN NOT NULL DEFAULT FALSE,
    rank_gainer INT,
    rank_loser INT,
    rank_most_invested INT,
    rank_least_invested INT,
    rank_most_active INT,
    rank_52w_high INT,
    rank_recently_viewed INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS venture_positions (
    id UUID PRIMARY KEY,
    user_id UUID,
    venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    shares BIGINT NOT NULL DEFAULT 0,
    share_class VARCHAR(100) NOT NULL DEFAULT 'Series A Preferred Stock',
    cost_basis NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    current_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    unrealized_pl NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    unrealized_pl_percent NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    ownership_percent NUMERIC(6, 3) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS venture_orders (
    id UUID PRIMARY KEY,
    user_id UUID,
    venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL DEFAULT 'BUY',
    share_class VARCHAR(100) NOT NULL DEFAULT 'Series A Preferred Stock',
    shares BIGINT NOT NULL,
    price_per_share NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'FILLED',
    settlement_status VARCHAR(50) NOT NULL DEFAULT 'SETTLED',
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS venture_news (
    id UUID PRIMARY KEY,
    venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    snippet TEXT NOT NULL,
    sentiment VARCHAR(20) NOT NULL DEFAULT 'Bullish',
    impact_metric VARCHAR(100),
    source VARCHAR(100) NOT NULL DEFAULT 'VentureWire Regulatory Wire',
    read_time VARCHAR(50) DEFAULT '3 min read',
    urgency VARCHAR(50) DEFAULT 'Medium',
    due_date VARCHAR(100),
    is_action_required BOOLEAN NOT NULL DEFAULT FALSE,
    action_label VARCHAR(100),
    action_type VARCHAR(50),
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed 250 Venture Capital & Start-up Issuers
`;

// Insert batches
const BATCH_SIZE = 50;
for (let i = 0; i < ventures.length; i += BATCH_SIZE) {
  const batch = ventures.slice(i, i + BATCH_SIZE);
  sql += `INSERT INTO ventures (id, ticker, name, short_name, legal_entity, cik, sector, sub_industry, headquarters, region, founded_year, ceo, employees, valuation, valuation_num, annual_revenue, annual_revenue_num, verification_level, trust_score, description, logo_color, status, exchange_tier, is_active, round_type, target_raise, target_raise_num, raised_amount, raised_amount_num, min_investment, min_investment_num, funding_purpose, security_type) VALUES\n`;
  const rows = batch.map(v => `(${escapeSql(v.id)}, ${escapeSql(v.ticker)}, ${escapeSql(v.name)}, ${escapeSql(v.short_name)}, ${escapeSql(v.legal_entity)}, ${escapeSql(v.cik)}, ${escapeSql(v.sector)}, ${escapeSql(v.sub_industry)}, ${escapeSql(v.headquarters)}, ${escapeSql(v.region)}, ${v.founded_year}, ${escapeSql(v.ceo)}, ${v.employees}, ${escapeSql(v.valuation)}, ${v.valuation_num}, ${escapeSql(v.annual_revenue)}, ${v.annual_revenue_num}, ${escapeSql(v.verification_level)}, ${v.trust_score}, ${escapeSql(v.description)}, ${escapeSql(v.logo_color)}, ${escapeSql(v.status)}, ${escapeSql(v.exchange_tier)}, TRUE, ${escapeSql(v.round_type)}, ${escapeSql(v.target_raise)}, ${v.target_raise_num}, ${escapeSql(v.raised_amount)}, ${v.raised_amount_num}, ${escapeSql(v.min_investment)}, ${v.min_investment_num}, ${escapeSql(v.funding_purpose)}, ${escapeSql(v.security_type)})`);
  sql += rows.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n\n';
}

sql += '-- Seed Venture Market Metrics\n';
for (let i = 0; i < metrics.length; i += BATCH_SIZE) {
  const batch = metrics.slice(i, i + BATCH_SIZE);
  sql += `INSERT INTO venture_market_metrics (id, venture_id, change_24h, change_percent, is_positive, market_cap_gain_loss, invested_today, allocation_percent, trading_volume_today, is_52w_high, rank_gainer, rank_loser, rank_most_invested, rank_least_invested, rank_most_active, rank_52w_high, rank_recently_viewed) VALUES\n`;
  const rows = batch.map(m => `(${escapeSql(m.id)}, ${escapeSql(m.venture_id)}, ${escapeSql(m.change_24h)}, ${m.change_percent}, ${m.is_positive ? 'TRUE' : 'FALSE'}, ${escapeSql(m.market_cap_gain_loss)}, ${escapeSql(m.invested_today)}, ${m.allocation_percent}, ${escapeSql(m.trading_volume_today)}, ${m.is_52w_high ? 'TRUE' : 'FALSE'}, ${m.rank_gainer || 'NULL'}, ${m.rank_loser || 'NULL'}, ${m.rank_most_invested || 'NULL'}, ${m.rank_least_invested || 'NULL'}, ${m.rank_most_active || 'NULL'}, ${m.rank_52w_high || 'NULL'}, ${m.rank_recently_viewed || 'NULL'})`);
  sql += rows.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n\n';
}

const targetPath = path.resolve(__dirname, '../User Module/backend-spring/src/main/resources/db/migration/V10__ventures_schema_and_seed_250.sql');
fs.writeFileSync(targetPath, sql, 'utf8');
console.log(`Saved V10 migration to ${targetPath} (${(fs.statSync(targetPath).size / 1024).toFixed(1)} KB)`);
