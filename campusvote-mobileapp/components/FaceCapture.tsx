import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
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

export default function FaceCapture({ mode, onCapture, onCancel, instruction }: FaceCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const facing: CameraType = 'front'; // Force front camera for facial recognition
  const [capturing, setCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const startCountdown = useCallback(() => {
    setCountdown(3);
    let remaining = 3;
    const tick = () => {
      remaining -= 1;
      if (remaining <= 0) {
        setCountdown(null);
        takePhoto();
      } else {
        setCountdown(remaining);
        countdownRef.current = setTimeout(tick, 800);
      }
    };
    countdownRef.current = setTimeout(tick, 800);
  }, []);

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
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
        Alert.alert('Capture Failed', 'Could not capture image. Please try again.');
        setCapturing(false);
      }
    } catch (err) {
      console.error('Capture error:', err);
      Alert.alert('Capture Error', 'An error occurred while capturing. Please try again.');
      setCapturing(false);
    }
  };

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
          We need access to your camera to capture your face for {mode === 'enroll' ? 'enrollment' : 'verification'}.
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
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>
          {mode === 'enroll' ? 'Enroll Face' : 'Face Verification'}
        </Text>
        <View style={styles.switchBtn} />
      </View>

      <View style={styles.cameraWrap}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          mode="picture"
        >
          <View style={styles.faceFrame}>
            <View style={styles.frameCornerTL} />
            <View style={styles.frameCornerTR} />
            <View style={styles.frameCornerBL} />
            <View style={styles.frameCornerBR} />
          </View>

          <View style={styles.instructionBox}>
            <Ionicons name="person-circle-outline" size={18} color="#fff" style={styles.instrIcon} />
            <Text style={styles.instructionText}>
              {instruction ||
                (mode === 'enroll'
                  ? 'Position your face inside the frame. Ensure even lighting and look straight at the camera.'
                  : 'Position your face clearly. Ensure good lighting and look straight at the camera.')}
            </Text>
          </View>

          {countdown !== null && (
            <View style={styles.countdownOverlay}>
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          )}

          {capturing && !previewUri && (
            <View style={styles.capturingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.capturingText}>Processing...</Text>
            </View>
          )}

          {previewUri && (
            <View style={styles.previewOverlay}>
              <Image source={{ uri: previewUri }} style={styles.previewImage} />
            </View>
          )}
        </CameraView>
      </View>

      <View style={styles.bottomBar}>
        {previewUri ? (
          <>
            <TouchableOpacity style={styles.secondaryBtn} onPress={retake}>
              <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
              <Text style={styles.secondaryBtnText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, styles.primaryBtnCompact]}
              onPress={() => {
                if (previewUri) {
                }
              }}
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
  cameraWrap: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  faceFrame: {
    position: 'absolute',
    top: '22%',
    alignSelf: 'center',
    width: 260,
    height: 320,
  },
  frameCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primaryAccent,
    borderTopLeftRadius: 12,
  },
  frameCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primaryAccent,
    borderTopRightRadius: 12,
  },
  frameCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primaryAccent,
    borderBottomLeftRadius: 12,
  },
  frameCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primaryAccent,
    borderBottomRightRadius: 12,
  },
  instructionBox: {
    position: 'absolute',
    bottom: '12%',
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.65)',
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
