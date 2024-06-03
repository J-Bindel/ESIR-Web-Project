import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';

@Injectable()
export class ProducerService {
  private channelWrapper: ChannelWrapper;

  constructor() {
    const rabbitMqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
    const connection = amqp.connect([rabbitMqUrl]);
    this.channelWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        return channel.assertQueue('notificationQueue', { durable: true });
      },
    });
  }

  async addToNotificationQueue(notification: any) {
    try {
      await this.channelWrapper.sendToQueue(
        'notificationQueue',
        Buffer.from(JSON.stringify(notification)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding notification to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}