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
    text: 'What is one advantage of ECS over EKS for interview-ready talking points?',
    choices: [
      { label: 'ECS uses Kubernetes manifests natively', correct: false, explain: 'ECS does not use Kubernetes manifests. That is an advantage of EKS, not ECS.' },
      { label: 'ECS integrates directly with AWS Fargate and Service Discovery with less operational overhead', correct: true, explain: 'Correct. ECS can be easier to operate and integrates tightly with AWS Fargate, making it useful to mention in interviews.' }
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

function renderQuestion(index) {
  const question = questions[index];
  questionTitle.textContent = question.title;
  questionText.textContent = question.text;
  explanationText.textContent = 'Choose an answer to see the explanation.';
  choicesContainer.innerHTML = '';

  question.choices.forEach((choice, choiceIndex) => {
    const button = document.createElement('button');
    button.className = 'choice-button';
    button.textContent = choice.label;
    button.addEventListener('click', () => selectChoice(choice));
    choicesContainer.appendChild(button);
  });
}

function selectChoice(choice) {
  explanationText.textContent = choice.explain;
  const buttons = choicesContainer.querySelectorAll('button');
  buttons.forEach(button => button.disabled = true);
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
  questionTitle.textContent = 'Ready to play?';
  questionText.textContent = 'Click "Next question" to begin.';
  explanationText.textContent = 'Answers and explanations will appear here after you choose an option.';
  choicesContainer.innerHTML = '';
}

nextButton.addEventListener('click', nextQuestion);
resetButton.addEventListener('click', resetGame);

resetGame();
