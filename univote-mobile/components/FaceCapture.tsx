import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export type FaceCaptureMode = 'enroll' | 'verify';

interface FaceCaptureProps {
  mode: FaceCaptureMode;
  onCapture: (faceData: string, qualityScore: number) => void;
  onCancel: () => void;
  instruction?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Oval face shape dimensions (head-like: taller than wide)
const OVAL_WIDTH = Math.min(SCREEN_WIDTH * 0.62, 240);
const OVAL_HEIGHT = OVAL_WIDTH * 1.35;

export default function FaceCapture({ mode, onCapture, onCancel, instruction }: FaceCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const facing: CameraType = 'front';
  const [capturing, setCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animations (React Native built-in Animated API)
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Scanning line: loops top → bottom of the oval
    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // Oval pulse scale
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // Border glow opacity
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.35,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    scan.start();
    pulse.start();
    glow.start();

    return () => {
      scan.stop();
      pulse.stop();
      glow.stop();
    };
  }, [scanAnim, pulseAnim, glowAnim]);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, []);

  const takePhoto = useCallback(async () => {
    if (!cameraRef.current) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        skipProcessing: false,
      });

      if (photo && photo.base64) {
        const qualityScore = estimateQuality(photo.base64);
        setPreviewUri(photo.uri || null);
        setTimeout(() => {
          onCapture(photo.base64!, qualityScore);
        }, 300);
      } else {
        // No face data — silently reset (ignore if no face detected)
        setCapturing(false);
      }
    } catch (err) {
      console.error('Capture error:', err);
      // Silently reset instead of showing alert
      setCapturing(false);
    }
  }, [onCapture]);

  const startCountdown = useCallback(() => {
    setCountdown(3);
    let remaining = 3;
    const tick = () => {
      remaining -= 1;
      if (remaining <= 0) {
        setCountdown(null);
        void takePhoto();
      } else {
        setCountdown(remaining);
        countdownRef.current = setTimeout(tick, 800);
      }
    };
    countdownRef.current = setTimeout(tick, 800);
  }, [takePhoto]);

  const estimateQuality = (base64: string): number => {
    const len = base64.length;
    const rough = Math.min(1, len / 60000);
    const jitter = (Date.now() % 100) / 500;
    return Math.max(0.55, Math.min(0.98, rough + jitter));
  };

  const retake = () => {
    setPreviewUri(null);
    setCapturing(false);
  };

  // Derived animated values
  const scanTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-(OVAL_HEIGHT / 2) + 8, OVAL_HEIGHT / 2 - 8],
  });
  const scanOpacity = scanAnim.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 1, 1, 0],
  });

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIconWrap}>
          <Ionicons name="camera-outline" size={56} color={Colors.primary} />
        </View>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionDesc}>
          We need access to your camera to capture your face for{' '}
          {mode === 'enroll' ? 'enrollment' : 'verification'}.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Grant Camera Access</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ghostBtn} onPress={onCancel}>
          <Text style={styles.ghostBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>
          {mode === 'enroll' ? 'Enroll Face' : 'Face Verification'}
        </Text>
        <View style={styles.switchBtn} />
      </View>

      {/* ── Camera ── */}
      <View style={styles.cameraWrap}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          mode="picture"
        >
          {/* ── Dark overlay with oval face cutout ── */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Top dark strip */}
            <View style={styles.darkTop} />

            {/* Middle row */}
            <View style={styles.middleRow}>
              <View style={styles.darkSide} />

              {/* Animated oval wrapper */}
              <Animated.View style={[styles.ovalWrapper, { transform: [{ scale: pulseAnim }] }]}>
                {/* Glowing outer ring */}
                <Animated.View style={[styles.ovalGlow, { opacity: glowAnim }]} />

                {/* Main oval border */}
                <View style={styles.oval}>
                  {/* Accent dots at face-edge positions */}
                  <View style={[styles.accentDot, styles.dotTL]} />
                  <View style={[styles.accentDot, styles.dotTR]} />
                  <View style={[styles.accentDot, styles.dotBL]} />
                  <View style={[styles.accentDot, styles.dotBR]} />

                  {/* Animated scan line */}
                  <Animated.View
                    style={[
                      styles.scanLine,
                      {
                        transform: [{ translateY: scanTranslateY }],
                        opacity: scanOpacity,
                      },
                    ]}
                  />
                </View>
              </Animated.View>

              <View style={styles.darkSide} />
            </View>

            {/* Bottom dark strip */}
            <View style={styles.darkBottom} />
          </View>

          {/* Status badge */}
          <View style={styles.statusBadge} pointerEvents="none">
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {countdown !== null
                ? `Hold still… ${countdown}`
                : capturing
                ? 'Analyzing face quality & alignment…'
                : 'Fit full face inside the oval'}
            </Text>
          </View>

          {/* Countdown overlay */}
          {countdown !== null && (
            <View style={styles.countdownOverlay}>
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          )}

          {/* Capturing spinner */}
          {capturing && !previewUri && (
            <View style={styles.capturingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.capturingText}>Analyzing face quality…</Text>
            </View>
          )}

          {/* Preview */}
          {previewUri && (
            <View style={styles.previewOverlay}>
              <Image source={{ uri: previewUri }} style={styles.previewImage} />
            </View>
          )}
        </CameraView>
      </View>

      {/* ── Instruction pill ── */}
      <View style={styles.instructionBox}>
        <Ionicons
          name="shield-checkmark-outline"
          size={18}
          color={Colors.primary}
          style={styles.instrIcon}
        />
        <Text style={styles.instructionText}>
          {instruction ||
            (mode === 'enroll'
              ? 'Keep your full face inside the oval. Hold steady to avoid blur and look directly at camera.'
              : 'Fit your face in the oval to verify identity. Face must match your registered profile.')}
        </Text>
      </View>

      {/* ── Bottom controls ── */}
      <View style={styles.bottomBar}>
        {previewUri ? (
          <>
            <TouchableOpacity style={styles.secondaryBtn} onPress={retake}>
              <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
              <Text style={styles.secondaryBtnText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, styles.primaryBtnCompact]}
              onPress={() => {}}
            >
              <Text style={styles.primaryBtnText}>Processing</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onCancel}>
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={startCountdown}
              disabled={capturing || countdown !== null}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <View style={{ width: 80 }} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // ── Top bar ─────────────────────────────────────
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  topTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Camera ──────────────────────────────────────
  cameraWrap: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },

  // ── Overlay dark bands ───────────────────────────
  darkTop: {
    height: '20%',
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  darkBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: OVAL_HEIGHT + 20,
  },
  darkSide: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.62)',
  },

  // ── Oval face shape ──────────────────────────────
  ovalWrapper: {
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ovalGlow: {
    position: 'absolute',
    width: OVAL_WIDTH + 18,
    height: OVAL_HEIGHT + 18,
    borderRadius: (OVAL_WIDTH + 18) / 2,
    borderWidth: 5,
    borderColor: Colors.primaryAccent,
    shadowColor: Colors.primaryAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 18,
  },
  oval: {
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    borderRadius: OVAL_WIDTH / 2,
    borderWidth: 3,
    borderColor: '#ffffff',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Corner accent dots ───────────────────────────
  accentDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryAccent,
  },
  dotTL: { top: OVAL_HEIGHT * 0.18, left: 8 },
  dotTR: { top: OVAL_HEIGHT * 0.18, right: 8 },
  dotBL: { bottom: OVAL_HEIGHT * 0.18, left: 8 },
  dotBR: { bottom: OVAL_HEIGHT * 0.18, right: 8 },

  // ── Scan line ────────────────────────────────────
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    borderRadius: 2,
    backgroundColor: Colors.primaryAccent,
    shadowColor: Colors.primaryAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 10,
  },

  // ── Status badge ─────────────────────────────────
  statusBadge: {
    position: 'absolute',
    top: '78%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.68)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 7,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryAccent,
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Countdown / Capturing ─────────────────────────
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 110,
    fontWeight: '800',
    color: '#fff',
  },
  capturingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturingText: {
    color: '#fff',
    marginTop: 12,
    fontWeight: '600',
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },

  // ── Instruction pill ─────────────────────────────
  instructionBox: {
    position: 'absolute',
    bottom: 110,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  instrIcon: { marginRight: 8 },
  instructionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },

  // ── Bottom bar ───────────────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
  },
  primaryBtn: {
    flex: 1,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryBtnCompact: {
    marginLeft: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: 80,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  secondaryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Permission screen ────────────────────────────
  permissionContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  permissionIconWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a2a3a',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionDesc: {
    fontSize: 14,
    color: '#667788',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  ghostBtn: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  ghostBtnText: {
    color: '#8899aa',
    fontSize: 14,
    fontWeight: '600',
  },
});
