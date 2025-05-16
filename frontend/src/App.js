import React, { useState } from 'react';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const exportToPDF = () => {
  const input = document.getElementById("result-content");
  if (!input) return alert("No results to export!");

  html2canvas(input).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("VMem_Simulation_Result.pdf");
  });
};

const exportToCSV = (result) => {
  const rows = [
    ["Step", ...Array.from({ length: result.frames }, (_, i) => `Frame ${i + 1}`)],
    ...result.frameStates.map((frame, idx) => [
      `Step ${idx + 1}`,
      ...Array.from({ length: result.frames }, (_, i) => frame[i] ?? '-')
    ])
  ];

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);

  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `VMem_${result.algorithm}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function PageFaultsChart({ frameStates, pageFaultsPerStep }) {
  const labels = frameStates.map((_, i) => `Step ${i + 1}`);

  const data = {
    labels,
    datasets: [
      {
        label: 'Page Faults',
        data: pageFaultsPerStep,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Page Faults Over Steps',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return <Line data={data} options={options} />;
}

// Updated FrameVisualization with startStepIndex prop
function FrameVisualization({ frames, frameStates, startStepIndex = 0, pageFaultsPerStep = [] }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, fontWeight: 'bold' }}>
        <div style={{ width: 80 }}>Step</div>
        {Array.from({ length: frames }).map((_, i) => (
          <div key={i} style={{ width: 40, textAlign: 'center', marginRight: 5 }}>F{i + 1}</div>
        ))}
        <div style={{ width: 100, textAlign: 'center' }}>Page Faults</div> {/* New header */}
      </div>
      {frameStates.map((frame, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ width: 80 }}>Step {startStepIndex + idx + 1}</div>
          {Array.from({ length: frames }).map((_, i) => {
            const page = frame[i];
            return (
              <div
                key={i}
                style={{
                  width: 40,
                  height: 40,
                  border: '1px solid black',
                  backgroundColor: page != null ? '#d1e7dd' : '#f8d7da',
                  textAlign: 'center',
                  lineHeight: '40px',
                  marginRight: 5,
                }}
              >
                {page ?? '-'}
              </div>
            );
          })}
          {/* Page Faults column */}
          <div
            style={{
              width: 100,
              height: 40,
              border: '1px solid black',
              backgroundColor: '#f0f0f0',
              textAlign: 'center',
              lineHeight: '40px',
              fontWeight: 'bold',
              marginLeft: 5,
            }}
          >
            {pageFaultsPerStep.length > 0 ? pageFaultsPerStep[startStepIndex + idx] ?? 0 : 0}
          </div>
        </div>
      ))}
    </>
  );
}

function App() {
  const [refs, setRefs] = useState('');
  const [frames, setFrames] = useState(3);
  const [algorithm, setAlgorithm] = useState('FIFO');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('full');
  const [currentStep, setCurrentStep] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setCurrentStep(0);

    try {
      const refsArray = refs.split(',').map(x => {
        const num = Number(x.trim());
        if (isNaN(num)) throw new Error('Invalid reference number');
        return num;
      });

      const response = await fetch('http://localhost:5000/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refs: refsArray, frames: Number(frames), algorithm }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API Error');
      }

      const data = await response.json();
      setResult({ ...data, faultsPerStep: data.pageFaultsPerStep });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      maxWidth: 1200,
      margin: 'auto',
      padding: '2rem',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      background: 'linear-gradient(135deg, #f6f8fc 0%, #f1f4f9 100%)',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '2.5rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        marginBottom: '2rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{
          color: '#1a365d',
          fontSize: '2.8rem',
          marginBottom: '2rem',
          textAlign: 'center',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em'
        }}>Virtual Memory Simulator</h1>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '2.5rem',
          padding: '1.5rem',
          backgroundColor: 'rgba(241, 244, 249, 0.8)',
          borderRadius: '12px',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '0.75rem 1.5rem',
            backgroundColor: mode === 'full' ? 'white' : 'transparent',
            borderRadius: '8px',
            boxShadow: mode === 'full' ? '0 4px 6px rgba(0, 0, 0, 0.05)' : 'none',
            transition: 'all 0.2s ease'
          }}>
            <input
              type="radio"
              value="full"
              checked={mode === 'full'}
              onChange={() => { setMode('full'); setCurrentStep(0); }}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ 
              fontWeight: '600',
              color: mode === 'full' ? '#1a365d' : '#64748b'
            }}>Full Simulation</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '0.75rem 1.5rem',
            backgroundColor: mode === 'step' ? 'white' : 'transparent',
            borderRadius: '8px',
            boxShadow: mode === 'step' ? '0 4px 6px rgba(0, 0, 0, 0.05)' : 'none',
            transition: 'all 0.2s ease'
          }}>
            <input
              type="radio"
              value="step"
              checked={mode === 'step'}
              onChange={() => { setMode('step'); setCurrentStep(0); }}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ 
              fontWeight: '600',
              color: mode === 'step' ? '#1a365d' : '#64748b'
            }}>Step-by-Step Simulation</span>
          </label>
        </div>

        <form onSubmit={handleSubmit} style={{
          display: 'grid',
          gap: '1.75rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontWeight: '600',
              color: '#1a365d',
              fontSize: '1.1rem'
            }}>
              Page References (comma separated)
            </label>
            <input
              type="text"
              value={refs}
              onChange={(e) => setRefs(e.target.value)}
              placeholder="e.g. 1,2,3,4,1,2"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '10px',
                border: '2px solid #e2e8f0',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                ':focus': {
                  outline: 'none',
                  borderColor: '#4299e1',
                  boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.15)'
                }
              }}
              required
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontWeight: '600',
              color: '#1a365d',
              fontSize: '1.1rem'
            }}>
              Number of Frames
            </label>
            <input
              type="number"
              value={frames}
              onChange={(e) => setFrames(e.target.value)}
              min="1"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '10px',
                border: '2px solid #e2e8f0',
                fontSize: '1rem',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
              }}
              required
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontWeight: '600',
              color: '#1a365d',
              fontSize: '1.1rem'
            }}>
              Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '10px',
                border: '2px solid #e2e8f0',
                fontSize: '1rem',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                cursor: 'pointer'
              }}
            >
              <option value="FIFO">FIFO</option>
              <option value="LRU">LRU</option>
              <option value="Optimal">Optimal</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px rgba(66, 153, 225, 0.2)',
              ':hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 8px rgba(66, 153, 225, 0.3)'
              }
            }}
          >
            Run Simulation
          </button>
        </form>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fff5f5',
          color: '#c53030',
          padding: '1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: '1px solid #feb2b2',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Error</div>
          {error}
        </div>
      )}

      {result && (
        <div id="result-content" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{
            color: '#1a365d',
            fontSize: '2rem',
            marginBottom: '2rem',
            borderBottom: '2px solid #e2e8f0',
            paddingBottom: '1rem',
            fontWeight: '700'
          }}>Simulation Results</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f6f8fc 0%, #f1f4f9 100%)',
              padding: '1.5rem',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
            }}>
              <div style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Algorithm</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1a365d' }}>{result.algorithm}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f6f8fc 0%, #f1f4f9 100%)',
              padding: '1.5rem',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
            }}>
              <div style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Total References</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1a365d' }}>{result.totalReferences}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f6f8fc 0%, #f1f4f9 100%)',
              padding: '1.5rem',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
            }}>
              <div style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Page Faults</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1a365d' }}>{result.pageFaults}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f6f8fc 0%, #f1f4f9 100%)',
              padding: '1.5rem',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
            }}>
              <div style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Fault Rate</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1a365d' }}>{result.faultRate}</div>
            </div>
          </div>

          {mode === 'full' && (
            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{
                color: '#1a365d',
                fontSize: '1.6rem',
                marginBottom: '1.25rem',
                fontWeight: '600'
              }}>Frame States</h3>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '12px',
                fontFamily: 'monospace',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
              }}>
                {result.frameStates.map((frame, idx) => (
                  <div key={idx} style={{ 
                    marginBottom: '0.75rem',
                    padding: '0.5rem',
                    backgroundColor: idx % 2 === 0 ? 'rgba(241, 244, 249, 0.5)' : 'transparent',
                    borderRadius: '6px'
                  }}>
                    Step {idx + 1}: [{frame.join(', ')}]
                  </div>
                ))}
              </div>

              <h3 style={{
                color: '#1a365d',
                fontSize: '1.6rem',
                marginTop: '2.5rem',
                marginBottom: '1.25rem',
                fontWeight: '600'
              }}>Frame Visualization</h3>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
              }}>
                <FrameVisualization
                  frames={result.frames}
                  frameStates={result.frameStates}
                  pageFaultsPerStep={result.faultsPerStep}
                />
              </div>
            </div>
          )}

          {mode === 'step' && (
            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{
                color: '#1a365d',
                fontSize: '1.6rem',
                marginBottom: '1.25rem',
                fontWeight: '600'
              }}>Step {currentStep + 1} Frame State</h3>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '12px',
                fontFamily: 'monospace',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)',
                marginBottom: '1.5rem'
              }}>
                [{result.frameStates[currentStep].join(', ')}]
              </div>

              <h3 style={{
                color: '#1a365d',
                fontSize: '1.6rem',
                marginTop: '2.5rem',
                marginBottom: '1.25rem',
                fontWeight: '600'
              }}>Frame Visualization</h3>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
              }}>
                <FrameVisualization
                  frames={result.frames}
                  frameStates={[result.frameStates[currentStep]]}
                  startStepIndex={currentStep}
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '2rem'
              }}>
                <button
                  onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                  disabled={currentStep === 0}
                  style={{
                    padding: '0.875rem 1.75rem',
                    background: currentStep === 0 
                      ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)'
                      : 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                    color: currentStep === 0 ? '#64748b' : 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: currentStep === 0 ? 'none' : '0 4px 6px rgba(66, 153, 225, 0.2)',
                    ':hover': {
                      transform: currentStep === 0 ? 'none' : 'translateY(-1px)',
                      boxShadow: currentStep === 0 ? 'none' : '0 6px 8px rgba(66, 153, 225, 0.3)'
                    }
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentStep(s => Math.min(result.frameStates.length - 1, s + 1))}
                  disabled={currentStep === result.frameStates.length - 1}
                  style={{
                    padding: '0.875rem 1.75rem',
                    background: currentStep === result.frameStates.length - 1
                      ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)'
                      : 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                    color: currentStep === result.frameStates.length - 1 ? '#64748b' : 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: currentStep === result.frameStates.length - 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: currentStep === result.frameStates.length - 1 ? 'none' : '0 4px 6px rgba(66, 153, 225, 0.2)',
                    ':hover': {
                      transform: currentStep === result.frameStates.length - 1 ? 'none' : 'translateY(-1px)',
                      boxShadow: currentStep === result.frameStates.length - 1 ? 'none' : '0 6px 8px rgba(66, 153, 225, 0.3)'
                    }
                  }}
                >
                  Next
                </button>

                {currentStep === result.frameStates.length - 1 && (
                  <span style={{
                    color: '#059669',
                    fontWeight: '600',
                    marginLeft: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ecfdf5',
                    borderRadius: '8px',
                    border: '1px solid #a7f3d0'
                  }}>
                    Simulation complete!
                  </span>
                )}
              </div>
            </div>
          )}

          {result.faultsPerStep && (
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{
                color: '#1a365d',
                fontSize: '1.6rem',
                marginBottom: '1.5rem',
                fontWeight: '600'
              }}>Page Faults Analysis</h3>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
              }}>
                <PageFaultsChart
                  frameStates={result.frameStates}
                  pageFaultsPerStep={result.faultsPerStep}
                />
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2.5rem',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => exportToCSV(result)}
              style={{
                padding: '0.875rem 1.75rem',
                background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(66, 153, 225, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                ':hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 8px rgba(66, 153, 225, 0.3)'
                }
              }}
            >
              <span>Export as CSV</span>
            </button>
            <button
              onClick={exportToPDF}
              style={{
                padding: '0.875rem 1.75rem',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(5, 150, 105, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                ':hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 8px rgba(5, 150, 105, 0.3)'
                }
              }}
            >
              <span>Export as PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
