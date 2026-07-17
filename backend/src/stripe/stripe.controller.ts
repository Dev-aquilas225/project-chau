import { Controller, Post, Headers, Req, Res, HttpStatus, Param, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';
import { OrdersService } from '../orders/orders.service';

@Controller('stripe')
export class StripeController {
  constructor(
    private stripeService: StripeService,
    private ordersService: OrdersService
  ) {}

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request & { rawBody?: Buffer },
    @Res() res: Response
  ) {
    let event: any;

    if (this.stripeService.getIsMockMode()) {
      // Mock webhook handling
      event = req.body;
    } else {
      if (!signature || !req.rawBody) {
        return res.status(HttpStatus.BAD_REQUEST).send('Signature ou Raw Body manquant');
      }
      event = this.stripeService.verifyWebhookSignature(req.rawBody.toString('utf8'), signature);
      if (!event) {
        return res.status(HttpStatus.BAD_REQUEST).send('Webhook signature verification failed');
      }
    }

    // Process event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;
      if (orderId) {
        try {
          await this.ordersService.updateStatus(orderId, 'paid', 'Paiement Stripe validé.');
        } catch (err) {
          console.error(`Erreur lors de la mise à jour de la commande ${orderId}: ${(err as any).message}`);
        }
      }
    }

    res.status(HttpStatus.OK).json({ received: true });
  }

  @Post('mock-confirm/:orderId')
  async mockConfirm(@Param('orderId') orderId: string) {
    if (!this.stripeService.getIsMockMode()) {
      throw new BadRequestException('La confirmation simulée n\'est disponible qu\'en mode MOCK (dev).');
    }

    try {
      await this.ordersService.updateStatus(orderId, 'paid', 'Paiement simulé validé.');
      return { success: true, message: 'Commande payée avec succès (simulation).' };
    } catch (err) {
      throw new BadRequestException(`Erreur de simulation: ${(err as any).message}`);
    }
  }
}
