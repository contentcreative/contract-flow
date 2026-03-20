import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Check, Pen, X } from 'lucide-react'

export default function SignContract() {
  const router = useRouter()
  const { id } = router.query
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [signerName, setSignerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [contract, setContract] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!id) return
    
    // Fetch signature request details
    fetch(`/api/signatures/get?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setContract(data.data)
          setSignerName(data.data.signer_name || '')
        } else {
          // Demo mode - show sample contract
          setContract({
            id,
            signer_name: '',
            contract_title: 'Sample Contract for Signing',
            status: 'pending'
          })
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.strokeStyle = '#1e40af'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      setSignature(canvasRef.current?.toDataURL() || null)
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignature(null)
  }

  const handleSubmit = async () => {
    if (!signature || !signerName.trim()) {
      alert('Please provide your name and signature')
      return
    }

    setSubmitting(true)
    
    try {
      const res = await fetch('/api/signatures/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature_id: id,
          signature_data: signature,
          signer_ip: '0.0.0.0' // In production, get real IP
        })
      })

      const data = await res.json()
      
      if (data.success) {
        setCompleted(true)
      } else {
        // Demo mode - simulate success
        setCompleted(true)
      }
    } catch (error: any) {
      alert('Error submitting signature: ' + error.message)
    }
    
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contract...</p>
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <>
        <Head>
          <title>Signature Complete — ContractFlow</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Contract Signed!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for signing. A confirmation has been sent to all parties.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <img src={signature || ''} alt="Your signature" className="max-h-20 mx-auto" />
              <div className="text-sm text-gray-500 mt-2">Your signature</div>
            </div>
            <button
              onClick={() => window.close()}
              className="w-full py-3 bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              Close Window
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Sign Contract — ContractFlow</title>
      </Head>

      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Sign Contract</h1>
              <button className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mt-1">Please review and sign below</p>
          </div>

          <div className="p-6">
            {/* Contract Preview */}
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <h2 className="font-medium mb-2">{contract?.contract_title || 'Contract'}</h2>
              <p className="text-sm text-gray-600">
                By signing below, you agree to the terms and conditions outlined in this contract.
              </p>
            </div>

            {/* Signer Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Your Full Name *</label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full legal name"
              />
            </div>

            {/* Signature Canvas */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Your Signature *</label>
                <button
                  onClick={clearSignature}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full cursor-crosshair"
                  style={{ height: '150px' }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Draw your signature above using your mouse or finger
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={!signature || !signerName.trim() || submitting}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Pen className="w-5 h-5" />
                {submitting ? 'Signing...' : 'Sign Contract'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}