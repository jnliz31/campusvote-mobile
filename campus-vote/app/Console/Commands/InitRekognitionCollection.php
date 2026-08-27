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
        $this->info('Initializing AWS Rekognition Collection...');

        try {
            $rekognition = app(RekognitionService::class);
            $collectionId = $rekognition->getCollectionId();

            $this->info("Collection ID: {$collectionId}");
            $this->info("Match Threshold: {$rekognition->getMatchThreshold()}%");
            $this->info("Quality Threshold: {$rekognition->getQualityThreshold()}%");

            if ($this->option('describe')) {
                $this->info('Checking collection status...');
            }

            $result = $rekognition->ensureCollectionExists();

            if ($result['exists']) {
                $this->info('Collection already exists.');
                $this->table(
                    ['Property', 'Value'],
                    [
                        ['Collection ID', $result['collection_id']],
                        ['Face Count', $result['face_count']],
                        ['ARN', $result['arn'] ?? 'N/A'],
                    ]
                );
            } else {
                $this->info('Collection created successfully!');
                $this->table(
                    ['Property', 'Value'],
                    [
                        ['Collection ID', $result['collection_id']],
                        ['ARN', $result['arn'] ?? 'N/A'],
                    ]
                );
            }

            $this->newLine();
            $this->info('Rekognition is ready.');

            return Command::SUCCESS;
        } catch (\Aws\Exception\AwsException $e) {
            $this->error('AWS Error: ' . $e->getMessage());
            $this->error('AWS Error Code: ' . $e->getAwsErrorCode());
            $this->newLine();
            $this->warn('Please check your AWS credentials in .env:');
            $this->line('  AWS_ACCESS_KEY_ID=...');
            $this->line('  AWS_SECRET_ACCESS_KEY=...');
            $this->line('  AWS_DEFAULT_REGION=ap-southeast-1');
            $this->line('  AWS_REKOGNITION_COLLECTION_ID=campusvote-voters');

            return Command::FAILURE;
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());

            return Command::FAILURE;
        }
    }
}
