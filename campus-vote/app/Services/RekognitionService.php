<?php

namespace App\Services;

use Aws\Rekognition\RekognitionClient;
use Aws\Exception\AwsException;
use Illuminate\Support\Facades\Log;

class RekognitionService
{
    private RekognitionClient $client;
    private string $collectionId;
    private float $matchThreshold;
    private float $qualityThreshold;

    public function __construct()
    {
        $config = config('services.rekognition');

        $this->client = new RekognitionClient([
            'version' => 'latest',
            'region' => $config['region'] ?? 'ap-southeast-1',
            'credentials' => [
                'key' => $config['key'],
                'secret' => $config['secret'],
            ],
        ]);

        $this->collectionId = $config['collection_id'] ?? 'campusvote-voters';
        $this->matchThreshold = $config['match_threshold'] ?? 80;
        $this->qualityThreshold = $config['quality_threshold'] ?? 70;
    }

    /**
     * Create the Rekognition Collection if it doesn't already exist (idempotent).
     */
    public function ensureCollectionExists(): array
    {
        try {
            $result = $this->client->describeCollection([
                'CollectionId' => $this->collectionId,
            ]);

            Log::info('Rekognition collection already exists', [
                'collection_id' => $this->collectionId,
                'face_count' => $result['FaceCount'] ?? 0,
            ]);

            return [
                'exists' => true,
                'collection_id' => $this->collectionId,
                'face_count' => $result['FaceCount'] ?? 0,
                'arn' => $result['CollectionARN'] ?? null,
            ];
        } catch (AwsException $e) {
            if ($e->getAwsErrorCode() === 'ResourceNotFoundException') {
                Log::info('Creating Rekognition collection', [
                    'collection_id' => $this->collectionId,
                ]);

                $result = $this->client->createCollection([
                    'CollectionId' => $this->collectionId,
                ]);

                return [
                    'exists' => false,
                    'created' => true,
                    'collection_id' => $this->collectionId,
                    'arn' => $result['CollectionArn'] ?? null,
                ];
            }

            Log::error('Failed to describe/create Rekognition collection', [
                'error' => $e->getMessage(),
                'code' => $e->getAwsErrorCode(),
            ]);

            throw $e;
        }
    }

    /**
     * Pre-flight face detection: verifies an image contains exactly one face
     * and that its quality meets minimum thresholds.
     *
     * @param string $imageBytes Raw image bytes (JPEG/PNG, no data-URI prefix)
     * @return array{hasFace: bool, faceCount: int, quality: array{brightness: float, sharpness: float}, confidence: float, boundingBox: array|null}
     */
    public function detectFaceQuality(string $imageBytes): array
    {
        try {
            $result = $this->client->detectFaces([
                'Image' => ['Bytes' => $imageBytes],
                'Attributes' => ['ALL'],
            ]);

            $faces = $result['FaceDetails'] ?? [];
            $faceCount = count($faces);

            if ($faceCount === 0) {
                return [
                    'hasFace' => false,
                    'faceCount' => 0,
                    'quality' => ['brightness' => 0, 'sharpness' => 0],
                    'confidence' => 0,
                    'boundingBox' => null,
                ];
            }

            // Use the first (most prominent) face
            $face = $faces[0];
            $brightness = $face['Quality']['Brightness'] ?? 0;
            $sharpness = $face['Quality']['Sharpness'] ?? 0;
            $confidence = $face['Confidence'] ?? 0;
            $box = $face['BoundingBox'] ?? null;

            Log::info('Rekognition detectFaces result', [
                'face_count' => $faceCount,
                'brightness' => $brightness,
                'sharpness' => $sharpness,
                'confidence' => $confidence,
            ]);

            return [
                'hasFace' => true,
                'faceCount' => $faceCount,
                'quality' => [
                    'brightness' => round($brightness, 2),
                    'sharpness' => round($sharpness, 2),
                ],
                'confidence' => round($confidence, 2),
                'boundingBox' => $box ? [
                    'left' => $box['Left'],
                    'top' => $box['Top'],
                    'width' => $box['Width'],
                    'height' => $box['Height'],
                ] : null,
            ];
        } catch (AwsException $e) {
            Log::error('Rekognition detectFaces error', [
                'error' => $e->getMessage(),
                'code' => $e->getAwsErrorCode(),
            ]);

            throw $e;
        }
    }

    /**
     * Enroll a voter's face into the Rekognition Collection.
     *
     * @param int $voterId The voter's database ID
     * @param string $imageBytes Raw image bytes (JPEG/PNG)
     * @return array{face_id: string, external_image_id: string, quality: array{brightness: float, sharpness: float}, indexed: bool}
     */
    public function enrollFace(int $voterId, string $imageBytes): array
    {
        $externalImageId = "voter_{$voterId}";

        try {
            $result = $this->client->indexFaces([
                'CollectionId' => $this->collectionId,
                'Image' => ['Bytes' => $imageBytes],
                'ExternalImageId' => $externalImageId,
                'MaxFaces' => 1,
                'QualityFilter' => 'AUTO',
                'DetectionAttributes' => ['ALL'],
            ]);

            $indexedFaces = $result['FaceRecords'] ?? [];

            if (empty($indexedFaces)) {
                Log::warning('Rekognition IndexFaces returned no faces', [
                    'voter_id' => $voterId,
                ]);

                return [
                    'face_id' => null,
                    'external_image_id' => $externalImageId,
                    'quality' => ['brightness' => 0, 'sharpness' => 0],
                    'indexed' => false,
                ];
            }

            $faceRecord = $indexedFaces[0];
            $faceId = $faceRecord['Face']['FaceId'];
            $faceDetail = $faceRecord['FaceDetail'] ?? [];

            $brightness = $faceDetail['Quality']['Brightness'] ?? 0;
            $sharpness = $faceDetail['Quality']['Sharpness'] ?? 0;

            Log::info('Rekognition face enrolled', [
                'voter_id' => $voterId,
                'face_id' => $faceId,
                'brightness' => $brightness,
                'sharpness' => $sharpness,
            ]);

            return [
                'face_id' => $faceId,
                'external_image_id' => $externalImageId,
                'quality' => [
                    'brightness' => round($brightness, 2),
                    'sharpness' => round($sharpness, 2),
                ],
                'indexed' => true,
            ];
        } catch (AwsException $e) {
            Log::error('Rekognition enrollFace error', [
                'voter_id' => $voterId,
                'error' => $e->getMessage(),
                'code' => $e->getAwsErrorCode(),
            ]);

            throw $e;
        }
    }

    /**
     * Verify a captured face against the voter's enrolled face.
     *
     * Uses SearchFacesByImage to find similar faces, then filters to only
     * match against the voter's own enrolled FaceId.
     *
     * @param int $voterId The voter's database ID
     * @param string $storedFaceId The voter's enrolled Rekognition FaceId
     * @param string $imageBytes Raw captured image bytes (JPEG/PNG)
     * @return array{matched: bool, similarity: float, faceMatches: array}
     */
    public function verifyFace(int $voterId, string $storedFaceId, string $imageBytes): array
    {
        try {
            $result = $this->client->searchFacesByImage([
                'CollectionId' => $this->collectionId,
                'Image' => ['Bytes' => $imageBytes],
                'MaxFaces' => 5,
                'FaceMatchThreshold' => 50, // Low threshold to get candidates; we filter ourselves
            ]);

            $faceMatches = $result['FaceMatches'] ?? [];

            // Find the match that corresponds to this voter's own FaceId
            $ownMatch = null;
            foreach ($faceMatches as $match) {
                if (($match['Face']['FaceId'] ?? null) === $storedFaceId) {
                    $ownMatch = $match;
                    break;
                }
            }

            if ($ownMatch === null) {
                Log::info('Rekognition verify: no match for voter face_id', [
                    'voter_id' => $voterId,
                    'stored_face_id' => $storedFaceId,
                    'total_matches' => count($faceMatches),
                ]);

                return [
                    'matched' => false,
                    'similarity' => 0,
                    'faceMatches' => [],
                ];
            }

            $similarity = round($ownMatch['Similarity'] ?? 0, 2);
            $matched = $similarity >= $this->matchThreshold;

            Log::info('Rekognition verify result', [
                'voter_id' => $voterId,
                'similarity' => $similarity,
                'matched' => $matched,
                'threshold' => $this->matchThreshold,
            ]);

            return [
                'matched' => $matched,
                'similarity' => $similarity,
                'faceMatches' => array_map(fn($m) => [
                    'face_id' => $m['Face']['FaceId'] ?? null,
                    'similarity' => round($m['Similarity'] ?? 0, 2),
                ], $faceMatches),
            ];
        } catch (AwsException $e) {
            Log::error('Rekognition verifyFace error', [
                'voter_id' => $voterId,
                'error' => $e->getMessage(),
                'code' => $e->getAwsErrorCode(),
            ]);

            throw $e;
        }
    }

    /**
     * Remove a face from the Rekognition Collection.
     *
     * @param string $faceId The Rekognition FaceId to delete
     * @return bool True if deleted, false if not found
     */
    public function removeFace(string $faceId): bool
    {
        try {
            $result = $this->client->deleteFaces([
                'CollectionId' => $this->collectionId,
                'FaceIds' => [$faceId],
            ]);

            $deletedCount = count($result['DeletedFaces'] ?? []);

            Log::info('Rekognition face removed', [
                'face_id' => $faceId,
                'deleted' => $deletedCount > 0,
            ]);

            return $deletedCount > 0;
        } catch (AwsException $e) {
            if ($e->getAwsErrorCode() === 'ResourceNotFoundException') {
                Log::warning('Rekognition face not found for deletion', [
                    'face_id' => $faceId,
                ]);
                return false;
            }

            Log::error('Rekognition removeFace error', [
                'face_id' => $faceId,
                'error' => $e->getMessage(),
                'code' => $e->getAwsErrorCode(),
            ]);

            throw $e;
        }
    }

    /**
     * Remove all faces for a voter by their external image ID.
     * Useful when the stored face_id may be stale.
     */
    public function removeFacesByVoterId(int $voterId): int
    {
        $externalImageId = "voter_{$voterId}";

        try {
            $result = $this->client->listFaces([
                'CollectionId' => $this->collectionId,
                'MaxResults' => 100,
            ]);

            $faceIds = [];
            foreach ($result['Faces'] ?? [] as $face) {
                if (($face['ExternalImageId'] ?? '') === $externalImageId) {
                    $faceIds[] = $face['FaceId'];
                }
            }

            if (empty($faceIds)) {
                return 0;
            }

            $deleteResult = $this->client->deleteFaces([
                'CollectionId' => $this->collectionId,
                'FaceIds' => $faceIds,
            ]);

            return count($deleteResult['DeletedFaces'] ?? []);
        } catch (AwsException $e) {
            Log::error('Rekognition removeFacesByVoterId error', [
                'voter_id' => $voterId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Strip data-URI prefix from base64 string and decode to raw bytes.
     *
     * @param string $base64 Base64 string, optionally with data:image/xxx;base64, prefix
     * @return string Raw image bytes
     */
    public static function decodeImage(string $base64): string
    {
        // Strip data-URI prefix if present
        if (str_contains($base64, ';base64,')) {
            $base64 = preg_replace('/^data:image\/\w+;base64,/', '', $base64);
        }

        $decoded = base64_decode($base64, true);

        if ($decoded === false) {
            throw new \InvalidArgumentException('Invalid base64 image data');
        }

        return $decoded;
    }

    /**
     * Validate that raw bytes look like a JPEG or PNG image.
     */
    public static function validateImageFormat(string $bytes): bool
    {
        $len = strlen($bytes);
        if ($len < 4) {
            return false;
        }

        // JPEG magic: FF D8 FF
        if (ord($bytes[0]) === 0xFF && ord($bytes[1]) === 0xD8 && ord($bytes[2]) === 0xFF) {
            return true;
        }

        // PNG magic: 89 50 4E 47
        if (ord($bytes[0]) === 0x89 && $bytes[1] === 'P' && $bytes[2] === 'N' && $bytes[3] === 'G') {
            return true;
        }

        return false;
    }

    public function getMatchThreshold(): float
    {
        return $this->matchThreshold;
    }

    public function getQualityThreshold(): float
    {
        return $this->qualityThreshold;
    }

    public function getCollectionId(): string
    {
        return $this->collectionId;
    }
}
