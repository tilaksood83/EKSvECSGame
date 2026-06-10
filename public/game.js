const questions = [
  {
    title: 'Question 1',
    text: 'You need to run containerized workloads with managed Kubernetes and want the full Kubernetes API compatibility. Which service is the better fit?',
    choices: [
      { label: 'Amazon ECS', correct: false, explain: 'ECS is AWS-managed but does not expose the full Kubernetes API. EKS is the right choice when you need Kubernetes-native tooling and compatibility.' },
      { label: 'Amazon EKS', correct: true, explain: 'Correct. EKS is AWS-hosted Kubernetes and supports the full Kubernetes API surface, making it ideal for Kubernetes-native workloads.' }
    ]
  },
  {
    title: 'Question 2',
    text: 'A team wants a simpler AWS-native container service without managing Kubernetes control planes. Which AWS service is usually easier to start with?',
    choices: [
      { label: 'Amazon EKS', correct: false, explain: 'EKS requires Kubernetes expertise and cluster management, so it is usually more complex for simple AWS-native container workloads.' },
      { label: 'Amazon ECS', correct: true, explain: 'Correct. ECS is simpler for AWS-native container deployments and has fewer Kubernetes-specific operations to manage.' }
    ]
  },
  {
    title: 'Question 3',
    text: 'Which of these is a common challenge when setting up an EKS cluster on AWS?',
    choices: [
      { label: 'Configuring worker nodes and node groups for correct IAM permissions', correct: true, explain: 'EKS requires careful IAM role setup for node pools and service accounts. Incorrect permissions are a common setup pitfall.' },
      { label: 'Choosing a container registry', correct: false, explain: 'While registry choice matters, the more common EKS setup challenge is cluster and node IAM configuration rather than registry selection.' }
    ]
  },
  {
    title: 'Question 4',
    text: 'What is a frequent pitfall when provisioning networking for EKS?',
    choices: [
      { label: 'Not configuring subnet CIDR ranges and security groups correctly', correct: true, explain: 'EKS networking depends on VPC configuration, subnets, route tables, and security groups. Mistakes here can break pod communication and node connectivity.' },
      { label: 'Deploying a Dockerfile with the wrong base image', correct: false, explain: 'This is an application issue, not an EKS cluster networking setup pitfall.' }
    ]
  },
  {
    title: 'Question 5',
    text: 'What is one advantage of ECS over EKS for talking points?',
    choices: [
      { label: 'ECS uses Kubernetes manifests natively', correct: false, explain: 'ECS does not use Kubernetes manifests. That is an advantage of EKS, not ECS.' },
      { label: 'ECS integrates directly with AWS Fargate and Service Discovery with less operational overhead', correct: true, explain: 'Correct. ECS can be easier to operate and integrates tightly with AWS Fargate, making it useful to mention when discussing container service options.' }
    ]
  },
  {
    title: 'Question 6',
    text: 'If you want Kubernetes-native pod networking, IAM for pods, and managed node groups, which EKS feature should you include?',
    choices: [
      { label: 'IRSA and managed node groups', correct: true, explain: 'Correct. IRSA is recommended for pod-level permissions, and managed node groups simplify worker node lifecycle management in EKS.' },
      { label: 'Only a public subnet and service account', correct: false, explain: 'A public subnet alone does not provide the Kubernetes-native capabilities or secure IAM handling that IRSA and managed node groups offer.' }
    ]
  }
];

let currentQuestionIndex = -1;
const questionTitle = document.getElementById('question-title');
const questionText = document.getElementById('question-text');
const choicesContainer = document.getElementById('choices');
const explanationText = document.getElementById('explanation-text');
const nextButton = document.getElementById('next-btn');
const resetButton = document.getElementById('reset-btn');

const clusterNameInput = document.getElementById('cluster-name');
const regionSelect = document.getElementById('region');
const k8sVersionSelect = document.getElementById('k8s-version');
const subnetTypeSelect = document.getElementById('subnet-type');
const instanceTypeSelect = document.getElementById('instance-type');
const nodeCountInput = document.getElementById('node-count');
const useFargateCheckbox = document.getElementById('use-fargate');
const iamRoleCheckbox = document.getElementById('iam-role');
const irsaCheckbox = document.getElementById('irsa');
const autoscalingCheckbox = document.getElementById('autoscaling');
const simulateButton = document.getElementById('simulate-btn');
const clearSimButton = document.getElementById('clear-sim-btn');
const simulationSummary = document.getElementById('simulation-summary');
const simulationTips = document.getElementById('simulation-tips');

// Self-managed options
const nodeGroupTypeRadios = document.querySelectorAll('input[name="node-group-type"]');
const selfManagedOptionsDiv = document.getElementById('self-managed-options');
const asgMinInput = document.getElementById('asg-min');
const asgMaxInput = document.getElementById('asg-max');
const customAmiInput = document.getElementById('custom-ami');
const bootstrapArgsInput = document.getElementById('bootstrap-args');
const enableSsmCheckbox = document.getElementById('enable-ssm');
const enableEbsOptimizationCheckbox = document.getElementById('enable-ebs-optimization');
const updateStrategySelect = document.getElementById('update-strategy');
const taggingStrategySelect = document.getElementById('tagging-strategy');

// Visualization elements
const clusterCanvas = document.getElementById('cluster-canvas');
const ctx = clusterCanvas.getContext('2d');
const addPodBtn = document.getElementById('add-pod-btn');
const startSimulationBtn = document.getElementById('start-simulation-btn');
const resetVizBtn = document.getElementById('reset-viz-btn');
const podsList = document.getElementById('pods-list');

// Autoscaling elements
const autoscalingOptionsDiv = document.getElementById('autoscaling-options');
const autoscaleMinInput = document.getElementById('autoscale-min');
const autoscaleMaxInput = document.getElementById('autoscale-max');
const cpuThresholdScaleUpInput = document.getElementById('cpu-threshold-scale-up');
const cpuThresholdScaleDownInput = document.getElementById('cpu-threshold-scale-down');
const scaleUpCooldownInput = document.getElementById('scale-up-cooldown');
const scaleDownCooldownInput = document.getElementById('scale-down-cooldown');
const loadCallsInput = document.getElementById('load-calls');
const generateLoadBtn = document.getElementById('generate-load-btn');
const loadSummary = document.getElementById('load-summary');

const clusterProcessesDiv = document.getElementById('cluster-processes');
const clusterLoadInfo = document.getElementById('cluster-load-info');
const reduceLoadBtn = document.getElementById('reduce-load-btn');
const historyList = document.getElementById('history-list');
const historySummary = document.getElementById('history-summary');

// Pod management
let pods = [];
let nodes = [];
let clusterConfig = null;
let autoscalingConfig = null;
let historyEntries = [];
let historyUpdateCounter = 0;
let lastScaleUpTime = 0;
let lastScaleDownTime = 0;
let simulationRunning = false;
let simulationInterval = null;
let loadCallCount = 0;
let currentLoadData = null;
let clusterProcesses = [
  { name: 'kubelet', status: 'running' },
  { name: 'kube-proxy', status: 'running' },
  { name: 'scheduler', status: 'running' },
  { name: 'controller-manager', status: 'running' },
  { name: 'cluster-autoscaler', status: 'running' }
];

function renderQuestion(index) {
  const question = questions[index];
  questionTitle.textContent = question.title;
  questionText.textContent = question.text;
  explanationText.textContent = 'Choose an answer to see the explanation.';
  choicesContainer.innerHTML = '';

  question.choices.forEach(choice => {
    const button = document.createElement('button');
    button.className = 'choice-button';
    button.textContent = choice.label;
    button.addEventListener('click', () => selectChoice(choice, button));
    choicesContainer.appendChild(button);
  });
}
    text: 'What is one advantage of ECS over EKS for talking points?',
function selectChoice(choice, selectedButton) {
  explanationText.textContent = choice.explain;
  const buttons = choicesContainer.querySelectorAll('button');
      { label: 'ECS integrates directly with AWS Fargate and Service Discovery with less operational overhead', correct: true, explain: 'Correct. ECS can be easier to operate and integrates tightly with AWS Fargate, making it useful to mention when discussing container service options.' }
    button.disabled = true;
    if (button === selectedButton) {
      button.classList.add(choice.correct ? 'correct' : 'wrong');
    }
  });
}

function nextQuestion() {
  currentQuestionIndex += 1;
  if (currentQuestionIndex >= questions.length) {
    currentQuestionIndex = 0;
    questionTitle.textContent = 'All done!';
    questionText.textContent = 'You have completed the game. Click Restart to play again.';
    explanationText.textContent = 'Review the questions again to reinforce differences and common EKS challenges.';
    choicesContainer.innerHTML = '';
    return;
  }
  renderQuestion(currentQuestionIndex);
}

function resetGame() {
  currentQuestionIndex = -1;
  questionTitle.textContent = '';
  questionText.textContent = '';
  explanationText.textContent = 'Answers and explanations will appear here after you choose an option.';
  choicesContainer.innerHTML = '';
}

function buildSimulationResult(config) {
  const warnings = [];
  const details = [];

  if (!config.clusterName) {
    warnings.push('Cluster name is required to identify the EKS cluster and resources in AWS.');
  }
  if (!config.region) {
    warnings.push('Choose a region before provisioning EKS to verify available instance types and VPC options.');
  }
  if (!config.k8sVersion) {
    warnings.push('Select a Kubernetes version. EKS supports specific versions and you should align with your application dependencies.');
  }
  if (!config.iamRole) {
    warnings.push('EKS node groups need an IAM role with worker and EKS permissions. Missing this will block node provisioning.');
  }
  if (!config.irsa) {
    warnings.push('IRSA service accounts are recommended for secure pod-level permissions. Without IRSA, you may over-provision IAM roles.');
  }
  if (config.subnetType === 'public') {
    warnings.push('Using public subnets for worker nodes increases exposure. Prefer private subnets for production EKS nodes.');
  }
  if (config.useFargate && config.nodeCount > 0) {
    details.push('Fargate is enabled, so node count can remain small if the workload is only scheduled on Fargate.');
  }
  if (!config.useFargate && config.nodeCount === 0) {
    warnings.push('A non-Fargate EKS cluster still needs nodes. Set a node count greater than zero for worker node groups.');
  }
  if (config.autoscaling && config.nodeCount < 2) {
    details.push('Cluster autoscaling is enabled, but starting with at least 2 nodes gives AWS room to scale and maintain high availability.');
  }

  // Self-managed specific warnings
  if (config.nodeGroupType === 'self-managed') {
    details.push('Self-managed node groups require additional EC2 lifecycle and patching operations. Managed node groups simplify this on EKS.');
    
    if (!config.asgMin || !config.asgMax) {
      warnings.push('Self-managed nodes: Define ASG Min and Max sizes for proper scaling.');
    }
    if (!config.enableSsm) {
      details.push('SSM access disabled: Consider enabling Session Manager for secure node access without SSH keys.');
    }
    if (config.updateStrategy === 'rolling') {
      details.push('Rolling update strategy: Nodes will be updated sequentially, maintaining availability.');
    } else if (config.updateStrategy === 'blue-green') {
      details.push('Blue-Green update strategy: New instances launch before old ones terminate, ensuring zero downtime.');
    }
    if (config.taggingStrategy === 'extended') {
      details.push('Extended tagging strategy: Includes version and managed status for better tracking.');
    }
  }

  const result = {
    title: 'EKS deployment readiness',
    message: 'Your configuration is a strong starting point for an EKS cluster.',
    warnings,
    details
  };

  if (warnings.length > 0) {
    result.message = 'The simulation found configuration issues and recommendations to improve EKS readiness.';
  }

  if (config.k8sVersion === '1.27') {
    details.push('Kubernetes 1.27 works, but newer EKS versions provide longer support windows and improved feature sets.');
  }

  if (config.useFargate && config.nodeCount === 0) {
    details.push('Using Fargate without node groups provides a serverless compute path for pods, which is helpful for many EKS workloads.');
  }

  return result;
}

function displaySimulationResult(result) {
  simulationSummary.textContent = result.message;
  simulationTips.innerHTML = '';

  result.warnings.concat(result.details).forEach(item => {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    simulationTips.appendChild(listItem);
  });

  if (result.warnings.length === 0 && result.details.length === 0) {
    const listItem = document.createElement('li');
    listItem.textContent = 'This configuration looks ready for a basic EKS deployment. Verify VPC, IAM, and workload-specific settings before rollout.';
    simulationTips.appendChild(listItem);
  }
}

function runSimulation() {
  const config = {
    clusterName: clusterNameInput.value.trim(),
    region: regionSelect.value,
    k8sVersion: k8sVersionSelect.value,
    subnetType: subnetTypeSelect.value,
    nodeGroupType: document.querySelector('input[name="node-group-type"]:checked').value,
    instanceType: instanceTypeSelect.value,
    nodeCount: Number(nodeCountInput.value),
    useFargate: useFargateCheckbox.checked,
    iamRole: iamRoleCheckbox.checked,
    irsa: irsaCheckbox.checked,
    autoscaling: autoscalingCheckbox.checked
  };

  const result = buildSimulationResult(config);
  displaySimulationResult(result);
}

function clearSimulation() {
  clusterNameInput.value = '';
  regionSelect.value = '';
  k8sVersionSelect.value = '';
  subnetTypeSelect.value = 'private';
  instanceTypeSelect.value = 't3.medium';
  nodeCountInput.value = '3';
  useFargateCheckbox.checked = false;
  iamRoleCheckbox.checked = true;
  irsaCheckbox.checked = true;
  autoscalingCheckbox.checked = false;
  simulationSummary.textContent = 'Complete the form and run the simulation to see the cluster readiness check.';
  simulationTips.innerHTML = '';
  loadSummary.textContent = '';
  historyEntries = [];
  renderHistory();
}

// ===== VISUALIZATION AND POD MANAGEMENT =====

class Pod {
  constructor(id, name, node) {
    this.id = id;
    this.name = name;
    this.node = node;
    this.status = 'running'; // running, terminating, restarting
    this.restartCount = 0;
    this.age = Math.floor(Math.random() * 3600) + 300; // age in seconds
    this.cpuUsage = Math.random() * 40 + 10; // 10-50% base CPU
    this.memoryUsage = Math.random() * 60 + 20; // 20-80% memory
    this.processes = [
      { name: 'app-server', status: 'running' },
      { name: 'metrics-agent', status: 'running' },
      { name: 'sidecar-proxy', status: 'running' }
    ];
  }

  incrementAge() {
    this.age += 1;
  }

  // Simulate CPU load changes and pod-level process activity
  updateLoad() {
    // Gradually fluctuate CPU usage
    const change = (Math.random() - 0.5) * 10;
    this.cpuUsage = Math.max(5, Math.min(95, this.cpuUsage + change));

    // Memory tends to grow slowly
    const memChange = (Math.random() - 0.4) * 5;
    this.memoryUsage = Math.max(10, Math.min(95, this.memoryUsage + memChange));

    // Update pod processes based on current load
    this.processes = this.processes.map(process => {
      const loadValue = this.cpuUsage * 0.5 + this.memoryUsage * 0.3;
      const chance = Math.random() * 100;
      let status = 'running';
      if (loadValue > 80 && chance > 55) {
        status = 'warn';
      }
      if (loadValue > 90 && chance > 80) {
        status = 'down';
      }
      return { ...process, status };
    });
  }

  getAgeString() {
    if (this.age < 60) return `${this.age}s`;
    if (this.age < 3600) return `${Math.floor(this.age / 60)}m`;
    return `${Math.floor(this.age / 3600)}h`;
  }
}

class Node {
  constructor(id, name, nodeGroupType) {
    this.id = id;
    this.name = name;
    this.nodeGroupType = nodeGroupType;
    this.status = 'Ready';
    this.podCount = 0;
    this.avgCpuUsage = 10;
    this.avgMemoryUsage = 20;
    this.createdAt = Date.now();
    this.scaledUpReason = null;
  }

  calculateAverageLoad(nodePods) {
    if (nodePods.length === 0) {
      this.avgCpuUsage = 10;
      this.avgMemoryUsage = 20;
      return;
    }

    this.avgCpuUsage = nodePods.reduce((sum, pod) => sum + pod.cpuUsage, 0) / nodePods.length;
    this.avgMemoryUsage = nodePods.reduce((sum, pod) => sum + pod.memoryUsage, 0) / nodePods.length;
  }

  getLoadStatus() {
    if (this.avgCpuUsage > 80) return 'critical';
    if (this.avgCpuUsage > 60) return 'warning';
    return 'healthy';
  }
}

function initializeCluster() {
  const nodeCount = parseInt(nodeCountInput.value) || 3;
  const nodeGroupType = document.querySelector('input[name="node-group-type"]:checked').value;
  
  nodes = [];
  pods = [];
  
  for (let i = 0; i < nodeCount; i++) {
    nodes.push(new Node(i, `node-${i + 1}`, nodeGroupType));
  }
  
  clusterConfig = {
    clusterName: clusterNameInput.value || 'my-cluster',
    nodeCount,
    nodeGroupType,
    autoscalingEnabled: autoscalingCheckbox.checked
  };

  // Initialize autoscaling config
  if (autoscalingCheckbox.checked) {
    autoscalingConfig = {
      minNodes: parseInt(autoscaleMinInput.value) || 2,
      maxNodes: parseInt(autoscaleMaxInput.value) || 10,
      cpuScaleUpThreshold: parseInt(cpuThresholdScaleUpInput.value) || 75,
      cpuScaleDownThreshold: parseInt(cpuThresholdScaleDownInput.value) || 30,
      scaleUpCooldown: parseInt(scaleUpCooldownInput.value) || 120,
      scaleDownCooldown: parseInt(scaleDownCooldownInput.value) || 300
    };
  }

  loadCallCount = Number(loadCallsInput?.value) || 1;
  currentLoadData = null;
  historyEntries = [];
  historyUpdateCounter = 0;
  clusterProcesses = [
    { name: 'kubelet', status: 'running' },
    { name: 'kube-proxy', status: 'running' },
    { name: 'scheduler', status: 'running' },
    { name: 'controller-manager', status: 'running' },
    { name: 'cluster-autoscaler', status: 'running' }
  ];

  lastScaleUpTime = 0;
  lastScaleDownTime = 0;
  addHistoryEntry(`Initialized cluster with ${nodeCount} node(s) and autoscaling ${autoscalingCheckbox.checked ? 'enabled' : 'disabled'}`);
}

async function fetchLoadData(calls) {
  const requestUrls = [`/api/load?calls=${calls}`, `http://localhost:3000/api/load?calls=${calls}`];

  for (const url of requestUrls) {
    try {
      const response = await fetch(url, { mode: url.startsWith('http') ? 'cors' : 'same-origin' });
      if (!response.ok) {
        throw new Error(`Failed to fetch load data from ${url} (${response.status})`);
      }
      const data = await response.json();
      currentLoadData = data;
      return data;
    } catch (error) {
      console.warn('Load fetch attempt failed:', error.message);
    }
  }

  console.warn('Falling back to client-side load generator');
  const safeCalls = Math.max(1, Math.min(20, calls || 1));
  const baseCpu = 30 + safeCalls * 5 + Math.floor(Math.random() * 10);
  const baseMem = 35 + safeCalls * 4 + Math.floor(Math.random() * 10);
  const data = {
    calls: safeCalls,
    clusterCpuLoad: Math.min(95, baseCpu),
    clusterMemoryLoad: Math.min(95, baseMem),
    detailLoads: Array.from({ length: safeCalls }, (_, index) => ({
      request: index + 1,
      cpuDelta: Math.min(95, Math.max(5, 15 + safeCalls + Math.floor(Math.random() * 10))),
      memoryDelta: Math.min(95, Math.max(10, 18 + safeCalls + Math.floor(Math.random() * 8)))
    })),
    generatedAt: new Date().toISOString()
  };

  currentLoadData = data;
  return data;
}

function renderClusterProcesses() {
  if (!clusterProcessesDiv) return;
  clusterProcessesDiv.innerHTML = '';
  clusterProcesses.forEach(proc => {
    const card = document.createElement('div');
    card.className = 'process-card';
    card.innerHTML = `
      <div class="process-name">${proc.name}</div>
      <div class="process-status ${proc.status}">${proc.status.toUpperCase()}</div>
    `;
    clusterProcessesDiv.appendChild(card);
  });
  if (clusterLoadInfo) {
    clusterLoadInfo.textContent = currentLoadData
      ? `Simulated external load: ${currentLoadData.clusterCpuLoad.toFixed(0)}% CPU, ${currentLoadData.clusterMemoryLoad.toFixed(0)}% memory from ${currentLoadData.calls} workload calls.`
      : 'No external API load generated yet. Use Generate Load to simulate incoming traffic.';
  }
}

function addHistoryEntry(message) {
  const timestamp = new Date();
  historyEntries.unshift({ timestamp, message });
  if (historyEntries.length > 20) {
    historyEntries.pop();
  }
  renderHistory();
}

function renderHistory() {
  if (!historyList) return;
  historyList.innerHTML = '';
  if (historyEntries.length === 0) {
    historyList.innerHTML = '<li>No cluster events yet. Start the simulation and generate load.</li>';
    return;
  }

  historyEntries.forEach(entry => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${entry.message}</strong><span>${entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>`;
    historyList.appendChild(item);
  });
}

function applyLoadData(loadData, action = 'Updated') {
  if (!loadData) return;
  currentLoadData = loadData;
  loadSummary.innerHTML = `${action} load: ${loadData.clusterCpuLoad.toFixed(0)}% CPU, ${loadData.clusterMemoryLoad.toFixed(0)}% memory from ${loadData.calls} workload call(s).`;
  addHistoryEntry(`${action} cluster load to ${loadData.clusterCpuLoad.toFixed(0)}% CPU / ${loadData.clusterMemoryLoad.toFixed(0)}% memory`);

  if (nodes.length > 0 && action === 'Increased') {
    const extraPods = Math.min(5, Math.max(1, Math.floor((loadData.clusterCpuLoad - 40) / 12)));
    for (let i = 0; i < extraPods; i += 1) {
      addPod();
    }
    addHistoryEntry(`Added ${extraPods} extra workload pod(s) to reflect higher external traffic.`);
  }

  if (nodes.length > 0) {
    runClusterUpdateCycle();
  }
}

function createReducedLoad() {
  const cpu = Math.max(10, (currentLoadData?.clusterCpuLoad || 25) - 25 + Math.floor(Math.random() * 5));
  const memory = Math.max(10, (currentLoadData?.clusterMemoryLoad || 20) - 20 + Math.floor(Math.random() * 5));
  return {
    calls: Math.max(1, (currentLoadData?.calls || 1) - 1),
    clusterCpuLoad: cpu,
    clusterMemoryLoad: memory,
    detailLoads: [{ request: 1, cpuDelta: Math.max(5, cpu - 10), memoryDelta: Math.max(8, memory - 10) }],
    generatedAt: new Date().toISOString()
  };
}

function addPod() {
  if (nodes.length === 0) {
    alert('Initialize cluster first by clicking "Start Simulation"');
    return;
  }
  
  const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
  const podId = `pod-${Date.now()}`;
  const podName = `app-pod-${pods.length + 1}`;
  
  const pod = new Pod(podId, podName, randomNode);
  pods.push(pod);
  
  randomNode.podCount++;
  
  renderPods();
  drawCluster();
}

function runClusterUpdateCycle() {
  updateClusterLoad();
  checkAutoScaling();
  renderPods();
  drawCluster();
}

function updateClusterLoad() {
  // Update pod loads
  pods.forEach(pod => {
    if (pod.status === 'running') {
      pod.updateLoad();
    }
  });

  // External API load contribution
  if (currentLoadData) {
    const apiCpuImpact = Math.max(0, currentLoadData.clusterCpuLoad - 30) * 0.35;
    const apiMemImpact = Math.max(0, currentLoadData.clusterMemoryLoad - 30) * 0.18;

    pods.forEach(pod => {
      if (pod.status !== 'running') return;
      const noiseCpu = (Math.random() - 0.5) * 6;
      const noiseMem = (Math.random() - 0.5) * 4;
      pod.cpuUsage = Math.min(95, Math.max(5, pod.cpuUsage + apiCpuImpact + noiseCpu));
      pod.memoryUsage = Math.min(95, Math.max(10, pod.memoryUsage + apiMemImpact + noiseMem));
    });
  }

  // Calculate node average loads and pod counts
  nodes.forEach(node => {
    const nodePods = pods.filter(p => p.node.id === node.id && p.status === 'running');
    node.podCount = nodePods.length;
    node.calculateAverageLoad(nodePods);
  });

  // Cluster process health changes when load spikes
  const clusterAvgCpu = nodes.length ? nodes.reduce((sum, node) => sum + node.avgCpuUsage, 0) / nodes.length : 0;
  clusterProcesses = clusterProcesses.map(proc => {
    if (clusterAvgCpu > 85 && proc.name === 'cluster-autoscaler') {
      return { ...proc, status: 'running' };
    }
    if (clusterAvgCpu > 80 && Math.random() > 0.65) {
      return { ...proc, status: 'warn' };
    }
    if (clusterAvgCpu > 92 && Math.random() > 0.75) {
      return { ...proc, status: 'down' };
    }
    return { ...proc, status: 'running' };
  });

  historyUpdateCounter += 1;
  if (historyUpdateCounter % 5 === 0) {
    addHistoryEntry(`Cluster load snapshot: ${clusterAvgCpu.toFixed(0)}% avg CPU across ${nodes.length} node(s)`);
  }

  renderClusterProcesses();
}

function checkAutoScaling() {
  if (!autoscalingConfig || simulationRunning === false) return;

  const now = Date.now() / 1000; // Current time in seconds
  const clusterAvgCpu = nodes.reduce((sum, node) => sum + node.avgCpuUsage, 0) / nodes.length;

  // Scale Up Decision
  if (clusterAvgCpu > autoscalingConfig.cpuScaleUpThreshold && nodes.length < autoscalingConfig.maxNodes) {
    if (now - lastScaleUpTime >= autoscalingConfig.scaleUpCooldown) {
      scaleUpCluster();
      lastScaleUpTime = now;
    }
  }

  // Scale Down Decision
  if (clusterAvgCpu < autoscalingConfig.cpuScaleDownThreshold && nodes.length > autoscalingConfig.minNodes) {
    if (now - lastScaleDownTime >= autoscalingConfig.scaleDownCooldown) {
      scaleDownCluster();
      lastScaleDownTime = now;
    }
  }
}

function scaleUpCluster() {
  if (nodes.length >= autoscalingConfig.maxNodes) return;

  const nodeGroupType = nodes[0]?.nodeGroupType || 'managed';
  const nextNodeId = nodes.reduce((max, node) => Math.max(max, node.id), -1) + 1;
  const newNode = new Node(nextNodeId, `node-${nextNodeId + 1}`, nodeGroupType);
  newNode.scaledUpReason = 'High CPU usage detected';
  nodes.push(newNode);
  addHistoryEntry(`Scaled up cluster: added ${newNode.name} due to sustained high CPU`);
  console.log('SCALED UP: Added new node due to high CPU usage');
}

function scaleDownCluster() {
  if (nodes.length <= autoscalingConfig.minNodes) return;

  // Prefer removing an idle node first
  let nodeToRemove = nodes.find(n => n.podCount === 0);

  if (!nodeToRemove) {
    // If no idle node exists, consolidate the lowest load node
    nodeToRemove = nodes.reduce((candidate, node) => {
      if (!candidate) return node;
      return node.avgCpuUsage < candidate.avgCpuUsage ? node : candidate;
    }, null);
  }

  if (!nodeToRemove) return;

  const remainingNode = nodes.find(n => n.id !== nodeToRemove.id);
  if (remainingNode) {
    pods.filter(p => p.node.id === nodeToRemove.id).forEach(pod => {
      pod.node = remainingNode;
    });
  }

  nodes = nodes.filter(n => n.id !== nodeToRemove.id);
  addHistoryEntry(`Scaled down cluster: removed ${nodeToRemove.name} and consolidated workloads`);
  console.log('SCALED DOWN: Removed node due to low CPU usage');
}

function killPod(podId) {
  const pod = pods.find(p => p.id === podId);
  if (!pod) return;
  
  pod.status = 'terminating';
  renderPods();
  drawCluster();
  
  // Simulate pod termination and restart
  setTimeout(() => {
    pod.status = 'restarting';
    renderPods();
    drawCluster();
  }, 1000);
  
  // Restart the pod
  setTimeout(() => {
    pod.status = 'running';
    pod.restartCount++;
    pod.age = 0;
    renderPods();
    drawCluster();
  }, 2500);
}

function renderPods() {
  podsList.innerHTML = '';
  
  if (pods.length === 0) {
    podsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No pods running. Add pods to see them here.</p>';
    return;
  }
  
  pods.forEach(pod => {
    const podCard = document.createElement('div');
    podCard.className = `pod-card ${pod.status === 'restarting' ? 'restarting' : ''}`;
    
    const statusClass = pod.status === 'running' ? 'running' : 
                       pod.status === 'terminating' ? 'terminating' : 'restarting';
    
    podCard.innerHTML = `
      <div class="pod-header">
        <span class="pod-name">${pod.name}</span>
        <span class="pod-status ${statusClass}">${pod.status}</span>
      </div>
      <div class="pod-details">
        <p><strong>Node:</strong> ${pod.node.name}</p>
        <p><strong>Restarts:</strong> ${pod.restartCount}</p>
        <p><strong>Age:</strong> ${pod.getAgeString()}</p>
        ${pod.status === 'running' ? `<p><strong>CPU:</strong> ${pod.cpuUsage.toFixed(1)}% | <strong>Mem:</strong> ${pod.memoryUsage.toFixed(1)}%</p>` : ''}
      </div>
      <div class="pod-processes">
        <strong>Processes:</strong>
        <ul>
          ${pod.processes.map(proc => `<li>${proc.name}: <span class="process-status ${proc.status}">${proc.status}</span></li>`).join('')}
        </ul>
      </div>
      <div class="pod-info">
        ${pod.status === 'running' ? '<strong>Status:</strong> Ready and available' : ''}
        ${pod.status === 'terminating' ? '<strong>Status:</strong> Graceful shutdown in progress...' : ''}
        ${pod.status === 'restarting' ? '<strong>Status:</strong> Restarting (auto-recovery)...' : ''}
      </div>
      <div class="pod-actions">
        ${pod.status === 'running' ? `<button class="pod-btn kill" onclick="killPod('${pod.id}')">Kill Pod</button>` : '<button class="pod-btn" disabled>Processing...</button>'}
        <button class="pod-btn" onclick="viewPodLogs('${pod.id}')">Logs</button>
      </div>
    `;
    
    podsList.appendChild(podCard);
  });
}

function viewPodLogs(podId) {
  const pod = pods.find(p => p.id === podId);
  if (pod) {
    alert(`Logs for ${pod.name}:\n\nNode: ${pod.node.name}\nStatus: ${pod.status}\nRestarts: ${pod.restartCount}\n\n[Log output would appear here]\n\n2026-06-10T10:30:45Z Application started\n2026-06-10T10:30:46Z Ready to receive connections`);
  }
}

function drawCluster() {
  const width = clusterCanvas.width;
  const height = clusterCanvas.height;
  
  // Clear canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // Draw title
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(clusterConfig?.clusterName || 'EKS Cluster', 20, 30);
  
  if (nodes.length === 0) {
    ctx.fillStyle = '#999';
    ctx.font = '14px sans-serif';
    ctx.fillText('Initialize cluster to see visualization', 20, 60);
    return;
  }
  
  // Calculate layout
  const nodeWidth = 120;
  const nodeHeight = 100;
  const spacing = 30;
  const nodesPerRow = Math.max(1, Math.floor((width - 40) / (nodeWidth + spacing)));
  
  // Draw nodes
  nodes.forEach((node, index) => {
    const row = Math.floor(index / nodesPerRow);
    const col = index % nodesPerRow;
    const x = 20 + col * (nodeWidth + spacing);
    const y = 60 + row * (nodeHeight + spacing);
    
    // Update node load from pods
    const nodePods = pods.filter(p => p.node.id === node.id && p.status === 'running');
    node.calculateAverageLoad(nodePods);
    
    // Node box color based on load
    let nodeColor = '#e0f2fe'; // Healthy
    let nodeBorderColor = '#0284c7';
    
    if (node.getLoadStatus() === 'critical') {
      nodeColor = '#fee2e2';
      nodeBorderColor = '#dc2626';
    } else if (node.getLoadStatus() === 'warning') {
      nodeColor = '#fef3c7';
      nodeBorderColor = '#f59e0b';
    }
    
    ctx.fillStyle = nodeColor;
    ctx.strokeStyle = nodeBorderColor;
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, nodeWidth, nodeHeight);
    ctx.strokeRect(x, y, nodeWidth, nodeHeight);
    
    // Node label
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(node.name, x + 8, y + 18);
    
    // Status
    ctx.font = '11px sans-serif';
    ctx.fillStyle = node.status === 'Ready' ? '#059669' : '#dc2626';
    ctx.fillText(`Status: ${node.status}`, x + 8, y + 35);
    
    // CPU/Memory load
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.fillText(`CPU: ${node.avgCpuUsage.toFixed(0)}%`, x + 8, y + 50);
    ctx.fillText(`Mem: ${node.avgMemoryUsage.toFixed(0)}%`, x + 8, y + 62);
    
    // Type badge
    ctx.font = '10px sans-serif';
    ctx.fillStyle = node.nodeGroupType === 'self-managed' ? '#9333ea' : '#059669';
    ctx.fillText(node.nodeGroupType === 'self-managed' ? 'Self-Managed' : 'Managed', x + 8, y + 85);
    
    // Draw pods on this node
    nodePods.forEach((pod, idx) => {
      const podX = x + 8 + (idx % 2) * 50;
      const podY = y + 70 + Math.floor(idx / 2) * 14;
      
      ctx.fillStyle = pod.status === 'running' ? '#86efac' : 
                     pod.status === 'terminating' ? '#fca5a5' : '#fbbf24';
      ctx.fillRect(podX, podY, 12, 12);
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      ctx.strokeRect(podX, podY, 12, 12);
    });
  });
  
  // Draw legend
  const legendY = height - 35;
  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#666';
  ctx.fillText('Legend - Pod Status:', 20, legendY);
  
  // Running pod
  ctx.fillStyle = '#86efac';
  ctx.fillRect(160, legendY - 12, 10, 10);
  ctx.fillStyle = '#1f2937';
  ctx.font = '11px sans-serif';
  ctx.fillText('Running', 175, legendY - 3);
  
  // Terminating pod
  ctx.fillStyle = '#fca5a5';
  ctx.fillRect(280, legendY - 12, 10, 10);
  ctx.fillStyle = '#1f2937';
  ctx.fillText('Terminating', 295, legendY - 3);
  
  // Restarting pod
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(440, legendY - 12, 10, 10);
  ctx.fillStyle = '#1f2937';
  ctx.fillText('Restarting', 455, legendY - 3);

  // Draw node load status legend
  const legendY2 = height - 15;
  ctx.font = '10px sans-serif';
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(20, legendY2 - 8, 8, 8);
  ctx.fillStyle = '#666';
  ctx.fillText('Healthy', 32, legendY2 - 2);
  
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(120, legendY2 - 8, 8, 8);
  ctx.fillStyle = '#666';
  ctx.fillText('Warning (CPU > 60%)', 132, legendY2 - 2);
  
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(290, legendY2 - 8, 8, 8);
  ctx.fillStyle = '#666';
  ctx.fillText('Critical (CPU > 80%)', 302, legendY2 - 2);
}

// ===== EVENT LISTENERS =====

// Toggle self-managed options visibility
nodeGroupTypeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    if (e.target.value === 'self-managed') {
      selfManagedOptionsDiv.style.display = 'block';
    } else {
      selfManagedOptionsDiv.style.display = 'none';
    }
  });
});

// Toggle autoscaling options visibility
autoscalingCheckbox.addEventListener('change', (e) => {
  if (e.target.checked) {
    autoscalingOptionsDiv.style.display = 'block';
  } else {
    autoscalingOptionsDiv.style.display = 'none';
  }
});

generateLoadBtn?.addEventListener('click', async () => {
  loadCallCount = Number(loadCallsInput.value) || 1;
  const loadData = await fetchLoadData(loadCallCount);
  if (loadData) {
    applyLoadData(loadData, 'Increased');
    if (nodes.length > 0) {
      runClusterUpdateCycle();
    }
  } else {
    loadSummary.textContent = 'Unable to generate simulated load. Check the backend API.';
  }
});

reduceLoadBtn?.addEventListener('click', () => {
  const reducedLoad = createReducedLoad();
  applyLoadData(reducedLoad, 'Reduced');
  if (nodes.length > 0) {
    runClusterUpdateCycle();
  }
});

// Main buttons
nextButton.addEventListener('click', nextQuestion);
resetButton.addEventListener('click', resetGame);

function startSimulationLoop() {
  simulationRunning = true;
  simulationInterval = setInterval(() => {
    if (pods.length > 0) {
      runClusterUpdateCycle();
    }
  }, 1000); // Update every 1 second
}

function stopSimulationLoop() {
  simulationRunning = false;
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

simulateButton.addEventListener('click', () => {
  const config = {
    clusterName: clusterNameInput.value.trim(),
    region: regionSelect.value,
    k8sVersion: k8sVersionSelect.value,
    subnetType: subnetTypeSelect.value,
    nodeGroupType: document.querySelector('input[name="node-group-type"]:checked').value,
    instanceType: instanceTypeSelect.value,
    nodeCount: Number(nodeCountInput.value),
    useFargate: useFargateCheckbox.checked,
    iamRole: iamRoleCheckbox.checked,
    irsa: irsaCheckbox.checked,
    autoscaling: autoscalingCheckbox.checked,
    // Self-managed options
    asgMin: parseInt(asgMinInput.value) || 0,
    asgMax: parseInt(asgMaxInput.value) || 0,
    customAmi: customAmiInput.value,
    bootstrapArgs: bootstrapArgsInput.value,
    enableSsm: enableSsmCheckbox.checked,
    enableEbsOptimization: enableEbsOptimizationCheckbox.checked,
    updateStrategy: updateStrategySelect.value,
    taggingStrategy: taggingStrategySelect.value
  };

  const result = buildSimulationResult(config);
  displaySimulationResult(result);
  
  // Initialize cluster for visualization
  initializeCluster();
  renderClusterProcesses();
  drawCluster();
});

clearSimButton.addEventListener('click', () => {
  stopSimulationLoop();
  clearSimulation();
  // Clear self-managed options
  asgMinInput.value = '1';
  asgMaxInput.value = '5';
  customAmiInput.value = '';
  bootstrapArgsInput.value = '';
  enableSsmCheckbox.checked = true;
  enableEbsOptimizationCheckbox.checked = false;
  updateStrategySelect.value = 'rolling';
  taggingStrategySelect.value = 'basic';
  
  // Clear visualization
  pods = [];
  nodes = [];
  historyEntries = [];
  renderHistory();
  drawCluster();
  renderPods();
});

// Visualization controls
addPodBtn.addEventListener('click', addPod);
startSimulationBtn.addEventListener('click', async () => {
  if (nodes.length === 0) {
    alert('Please run "Simulate EKS Deployment" first to initialize the cluster.');
    return;
  }

  loadCallCount = Number(loadCallsInput.value) || 1;
  if (!currentLoadData && loadCallCount > 1) {
    const loadData = await fetchLoadData(loadCallCount);
    if (loadData) {
      applyLoadData(loadData, 'Loaded');
    }
  }
  
  addHistoryEntry('Started runtime simulation and autoscaling loop.');

  // Add 3-5 random pods
  const podCount = Math.floor(Math.random() * 3) + 3;
  for (let i = 0; i < podCount; i++) {
    setTimeout(() => addPod(), i * 200);
  }
  
  // Start simulation loop for autoscaling
  startSimulationLoop();
});

resetVizBtn.addEventListener('click', () => {
  stopSimulationLoop();
  pods = [];
  nodes = [];
  clusterConfig = null;
  historyEntries = [];
  renderHistory();
  drawCluster();
  renderPods();
});

// Initialize
resetGame();
clearSimulation();
drawCluster();
renderClusterProcesses();
renderPods();
renderHistory();
