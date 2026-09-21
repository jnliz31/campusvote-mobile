<?php

namespace App\Console\Commands;

use App\Services\RekognitionService;
use Illuminate\Console\Command;

class InitRekognitionCollection extends Command
{
    protected $signature = 'rekognition:init
                            {--describe : Only check if the collection exists, do not create}';

    protected $description = 'Initialize the AWS Rekognition Collection for facial verification';

    public function handle(): int
    {
        $this->info('Initializing Facial Verification Service...');

        try {
            $rekognition = app(RekognitionService::class);
            $activeDriver = $rekognition->getActiveDriver();
            $collectionId = $rekognition->getCollectionId();

            $this->info("Active Driver: {$activeDriver}");
            $this->info("Match Threshold: {$rekognition->getMatchThreshold()}%");
            $this->info("Quality Threshold: {$rekognition->getQualityThreshold()}%");

            if (!$rekognition->isAwsMode()) {
                $this->newLine();
                $this->warn('System is running in LOCAL facial verification mode.');
                $this->line('  - Local mode performs image analysis and perceptual verification automatically.');
                $this->line('  - No AWS account or cloud credentials are required.');
                $this->line('  - To switch to AWS Rekognition, provide real credentials in .env:');
                $this->line('      AWS_ACCESS_KEY_ID=AKIA...');
                $this->line('      AWS_SECRET_ACCESS_KEY=...');
                $this->line('      AWS_DEFAULT_REGION=ap-southeast-1');
                $this->newLine();
                $this->info('Facial verification is ready to use in Local Mode.');
                return Command::SUCCESS;
            }

            $this->info("Collection ID: {$collectionId}");

            if ($this->option('describe')) {
                $this->info('Checking collection status...');
            }

            $result = $rekognition->ensureCollectionExists();

            if ($result['exists']) {
                $this->info('Rekognition collection already exists.');
                $this->table(
                    ['Property', 'Value'],
                    [
                        ['Driver', 'AWS Rekognition'],
                        ['Collection ID', $result['collection_id']],
                        ['Face Count', $result['face_count']],
                        ['ARN', $result['arn'] ?? 'N/A'],
                    ]
                );
            } else {
                $this->info('Rekognition collection created successfully!');
                $this->table(
                    ['Property', 'Value'],
                    [
                        ['Driver', 'AWS Rekognition'],
                        ['Collection ID', $result['collection_id']],
                        ['ARN', $result['arn'] ?? 'N/A'],
                    ]
                );
            }

            $this->newLine();
            $this->info('AWS Rekognition is ready.');

            return Command::SUCCESS;
        } catch (\Aws\Exception\AwsException $e) {
            $this->error('AWS Error: ' . $e->getMessage());
            $this->error('AWS Error Code: ' . $e->getAwsErrorCode());
            $this->newLine();
            $this->warn('AWS credentials are invalid or Rekognition is unreachable.');
            $this->line('The application will automatically fall back to Local Mode if FACIAL_RECOGNITION_DRIVER=auto.');
            $this->line('Or set FACIAL_RECOGNITION_DRIVER=local in .env to disable AWS calls entirely.');

            return Command::FAILURE;
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());

            return Command::FAILURE;
        }
    }
}
