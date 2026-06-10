const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/load', (req, res) => {
  const calls = Math.max(1, Math.min(20, parseInt(req.query.calls, 10) || 1));
  const baseCpu = 30 + calls * 5 + Math.floor(Math.random() * 10);
  const baseMem = 35 + calls * 4 + Math.floor(Math.random() * 10);
  const clusterCpuLoad = Math.min(95, baseCpu);
  const clusterMemoryLoad = Math.min(95, baseMem);
  const detailLoads = Array.from({ length: calls }, (_, index) => ({
    request: index + 1,
    cpuDelta: Math.min(95, Math.max(5, 15 + calls + Math.floor(Math.random() * 10))),
    memoryDelta: Math.min(95, Math.max(10, 18 + calls + Math.floor(Math.random() * 8)))
  }));

  res.json({
    calls,
    clusterCpuLoad,
    clusterMemoryLoad,
    detailLoads,
    generatedAt: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`EKS/ECS game running at http://localhost:${port}`);
});
