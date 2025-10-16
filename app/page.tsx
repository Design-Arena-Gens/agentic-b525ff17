'use client'

import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 400
    canvas.height = 600

    // Game variables
    let bird = {
      x: 50,
      y: 300,
      velocity: 0,
      radius: 15
    }

    const gravity = 0.5
    const jump = -9
    const pipeWidth = 60
    const pipeGap = 180
    let pipes: Array<{ x: number; topHeight: number }> = []
    let frameCount = 0
    let animationId: number

    // Initialize pipes
    const initPipes = () => {
      pipes = []
      for (let i = 0; i < 3; i++) {
        pipes.push({
          x: 400 + i * 250,
          topHeight: Math.random() * (canvas.height - pipeGap - 100) + 50
        })
      }
    }

    const drawBird = () => {
      ctx.fillStyle = '#FFD700'
      ctx.beginPath()
      ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2)
      ctx.fill()

      // Eye
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.arc(bird.x + 5, bird.y - 5, 3, 0, Math.PI * 2)
      ctx.fill()

      // Beak
      ctx.fillStyle = '#FF6347'
      ctx.beginPath()
      ctx.moveTo(bird.x + bird.radius, bird.y)
      ctx.lineTo(bird.x + bird.radius + 8, bird.y - 3)
      ctx.lineTo(bird.x + bird.radius + 8, bird.y + 3)
      ctx.closePath()
      ctx.fill()
    }

    const drawPipes = () => {
      ctx.fillStyle = '#228B22'
      pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight)
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, canvas.height)

        // Pipe caps
        ctx.fillStyle = '#32CD32'
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20)
        ctx.fillRect(pipe.x - 5, pipe.topHeight + pipeGap, pipeWidth + 10, 20)
        ctx.fillStyle = '#228B22'
      })
    }

    const updatePipes = () => {
      pipes.forEach(pipe => {
        pipe.x -= 3
      })

      // Add new pipe when the last one is far enough
      if (pipes[pipes.length - 1].x < canvas.width - 250) {
        pipes.push({
          x: canvas.width,
          topHeight: Math.random() * (canvas.height - pipeGap - 100) + 50
        })
      }

      // Remove pipes that are off screen
      if (pipes[0].x < -pipeWidth) {
        pipes.shift()
        setScore(s => s + 1)
      }
    }

    const checkCollision = () => {
      // Check ground and ceiling
      if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
        return true
      }

      // Check pipes
      for (let pipe of pipes) {
        if (
          bird.x + bird.radius > pipe.x &&
          bird.x - bird.radius < pipe.x + pipeWidth
        ) {
          if (
            bird.y - bird.radius < pipe.topHeight ||
            bird.y + bird.radius > pipe.topHeight + pipeGap
          ) {
            return true
          }
        }
      }

      return false
    }

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      ctx.fillStyle = '#87CEEB'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw ground
      ctx.fillStyle = '#DEB887'
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50)

      if (!gameStarted) {
        drawBird()
        ctx.fillStyle = '#000'
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Click or Press Space to Start', canvas.width / 2, canvas.height / 2 - 50)
        animationId = requestAnimationFrame(gameLoop)
        return
      }

      if (gameOver) {
        drawBird()
        drawPipes()
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#FFF'
        ctx.font = 'bold 36px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 50)
        ctx.font = 'bold 24px Arial'
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2)
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40)
        ctx.font = '18px Arial'
        ctx.fillText('Click or Press Space to Restart', canvas.width / 2, canvas.height / 2 + 100)
        return
      }

      // Update bird
      bird.velocity += gravity
      bird.y += bird.velocity

      // Update and draw pipes
      updatePipes()
      drawPipes()

      // Draw bird
      drawBird()

      // Check collision
      if (checkCollision()) {
        setGameOver(true)
        if (score > highScore) {
          setHighScore(score)
        }
        return
      }

      animationId = requestAnimationFrame(gameLoop)
    }

    const handleInput = () => {
      if (!gameStarted) {
        setGameStarted(true)
        initPipes()
        bird.y = 300
        bird.velocity = 0
        setScore(0)
      } else if (gameOver) {
        setGameOver(false)
        setGameStarted(false)
        bird.y = 300
        bird.velocity = 0
        pipes = []
      } else {
        bird.velocity = jump
      }
    }

    const handleClick = () => handleInput()
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handleInput()
      }
    }

    canvas.addEventListener('click', handleClick)
    window.addEventListener('keydown', handleKeyPress)

    gameLoop()

    return () => {
      cancelAnimationFrame(animationId)
      canvas.removeEventListener('click', handleClick)
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [gameStarted, gameOver, score, highScore])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #4ec0ca 0%, #87CEEB 100%)'
    }}>
      <h1 style={{
        color: '#fff',
        fontSize: '48px',
        marginBottom: '20px',
        textShadow: '3px 3px 6px rgba(0,0,0,0.3)'
      }}>
        Flappy Bird
      </h1>
      <div style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
      }}>
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            border: '3px solid #333'
          }}
        />
      </div>
      <div style={{
        marginTop: '20px',
        color: '#fff',
        fontSize: '24px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}>
        Score: {score} | High Score: {highScore}
      </div>
    </div>
  )
}
