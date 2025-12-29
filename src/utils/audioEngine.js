/**
 * Harmonic Chime Audio Engine - Session-based
 * Plays natural harmonic series that builds as more matching pixels are painted
 */

export class HarmonicChimeEngine {
  constructor() {
    // Initialize Web Audio API context
    this.audioContext = null
    this.masterGain = null

    // Pleasant base note options (all in the 4th octave)
    const baseNoteOptions = [
      261.63,  // C4
      293.66,  // D4
      329.63,  // E4
      349.23,  // F4
      392.00,  // G4
      440.00   // A4
    ]

    // Randomly select a base note for this session
    const baseNote = baseNoteOptions[Math.floor(Math.random() * baseNoteOptions.length)]

    // Harmonic frequencies - Warm and melodious
    this.frequencies = {
      fundamental: baseNote,           // Random base note
      octave: baseNote * 2,            // Octave (2x frequency)
      fifth: baseNote * 3,             // Perfect fifth (3x frequency)
      third: baseNote * 5              // Major third (5x frequency)
    }

    // Track active oscillators by layer (session-based, not edge-based)
    this.activeOscillators = {
      fundamental: null,
      octave: null,
      fifth: null,
      third: null
    }

    // Envelope parameters (in seconds) - original bell-like characteristics
    this.envelope = {
      attack: {
        fundamental: 0.05,  // 50ms - softer, like mallet strike
        octave: 0.04,       // 40ms
        fifth: 0.03,        // 30ms - higher harmonics respond faster
        third: 0.03         // 30ms
      },
      decay: 0.05,    // 50ms
      sustain: 0.7,   // Sustain level (0-1)
      release: 0.1,   // 100ms
      autoFade: 2.0   // Auto-fade duration (2s)
    }

    // Track scheduled fade timeouts
    this.fadeTimeouts = {
      fundamental: null,
      octave: null,
      fifth: null,
      third: null
    }

    // Volume per layer to prevent clipping
    this.layerVolumes = {
      fundamental: 0.15,
      octave: 0.12,
      fifth: 0.10,
      third: 0.08
    }
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.gain.value = 0.3
      this.masterGain.connect(this.audioContext.destination)
    }
  }

  /**
   * Determine which harmonic layers to play based on session match count
   * @param {number} sessionMatchCount - Total matching pixels painted in this session
   * @returns {Array<string>} - Array of layer names to activate
   */
  getActiveLayers(sessionMatchCount) {
    const layers = []

    if (sessionMatchCount >= 1) layers.push('fundamental')
    if (sessionMatchCount >= 2) layers.push('octave')
    if (sessionMatchCount >= 3) layers.push('fifth')
    if (sessionMatchCount >= 4) layers.push('third')

    return layers
  }

  /**
   * Start playing a harmonic layer
   * @param {string} layer - 'fundamental', 'octave', 'fifth', or 'third'
   */
  playLayer(layer) {
    this.initAudioContext()

    // Don't recreate if already playing
    if (this.activeOscillators[layer]) {
      return
    }

    const now = this.audioContext.currentTime
    const frequency = this.frequencies[layer]
    const volume = this.layerVolumes[layer]

    // Create oscillator (sine wave for pure, meditative tone)
    const oscillator = this.audioContext.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    // Create gain node for this layer
    const gainNode = this.audioContext.createGain()
    gainNode.gain.value = 0

    // Connect: oscillator -> gain -> master -> destination
    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)

    // Apply ADSR envelope with layer-specific attack time
    const attackTime = this.envelope.attack[layer]
    const attackEnd = now + attackTime
    const decayEnd = attackEnd + this.envelope.decay

    // Attack: 0 -> peak (exponential for more natural feel)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.exponentialRampToValueAtTime(volume, attackEnd)

    // Decay: peak -> sustain level
    gainNode.gain.linearRampToValueAtTime(
      volume * this.envelope.sustain,
      decayEnd
    )

    // Start the oscillator
    oscillator.start(now)

    // Store references
    this.activeOscillators[layer] = {
      oscillator,
      gainNode
    }

    // Schedule auto-fade after sustain period
    const fadeDelay = 800 // Start fading after 800ms of sustain
    this.fadeTimeouts[layer] = setTimeout(() => {
      this.autoFadeLayer(layer)
    }, fadeDelay)
  }

  /**
   * Auto-fade a layer gradually to silence
   * @param {string} layer - 'fundamental', 'octave', 'fifth', or 'third'
   */
  autoFadeLayer(layer) {
    const activeLayer = this.activeOscillators[layer]
    if (!activeLayer) return

    const now = this.audioContext.currentTime
    const { gainNode } = activeLayer

    // Gradually fade to silence over autoFade duration
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(gainNode.gain.value, now)
    gainNode.gain.linearRampToValueAtTime(0, now + this.envelope.autoFade)

    // Clean up after fade completes
    setTimeout(() => {
      if (this.activeOscillators[layer]) {
        this.stopLayer(layer)
      }
    }, this.envelope.autoFade * 1000)
  }

  /**
   * Stop playing a harmonic layer
   * @param {string} layer - 'fundamental', 'octave', 'fifth', or 'third'
   */
  stopLayer(layer) {
    const activeLayer = this.activeOscillators[layer]
    if (!activeLayer) return

    // Cancel any pending auto-fade
    if (this.fadeTimeouts[layer]) {
      clearTimeout(this.fadeTimeouts[layer])
      this.fadeTimeouts[layer] = null
    }

    const now = this.audioContext.currentTime
    const { oscillator, gainNode } = activeLayer

    // Apply release envelope
    gainNode.gain.cancelScheduledValues(now)
    gainNode.gain.setValueAtTime(gainNode.gain.value, now)
    gainNode.gain.linearRampToValueAtTime(0, now + this.envelope.release)

    // Stop oscillator after release
    oscillator.stop(now + this.envelope.release)

    // Clean up
    this.activeOscillators[layer] = null
  }

  /**
   * Play chime based on session match count
   * @param {number} sessionMatchCount - Total matching pixels painted in session
   */
  playChime(sessionMatchCount) {
    this.initAudioContext()

    const desiredLayers = this.getActiveLayers(sessionMatchCount)
    const allLayers = ['fundamental', 'octave', 'fifth', 'third']

    // For layers that should continue playing, cancel auto-fade and reschedule
    desiredLayers.forEach(layer => {
      if (this.activeOscillators[layer]) {
        // Cancel existing auto-fade
        if (this.fadeTimeouts[layer]) {
          clearTimeout(this.fadeTimeouts[layer])
        }
        // Reschedule new auto-fade
        const fadeDelay = 800
        this.fadeTimeouts[layer] = setTimeout(() => {
          this.autoFadeLayer(layer)
        }, fadeDelay)
      } else {
        // Start new layer
        this.playLayer(layer)
      }
    })

    // Stop layers that shouldn't be playing (shouldn't happen in practice)
    allLayers.forEach(layer => {
      const isActive = this.activeOscillators[layer] !== null
      if (!desiredLayers.includes(layer) && isActive) {
        this.stopLayer(layer)
      }
    })
  }

  /**
   * Stop all audio (cleanup)
   */
  stopAll() {
    const layers = ['fundamental', 'octave', 'fifth', 'third']
    layers.forEach(layer => {
      if (this.activeOscillators[layer]) {
        this.stopLayer(layer)
      }
    })
  }

  /**
   * Set master volume
   * @param {number} volume - Volume level (0-1)
   */
  setMasterVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume))
    }
  }
}
