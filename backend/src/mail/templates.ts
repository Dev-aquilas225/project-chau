const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

function layout(title: string, bodyHtml: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f5f3ee;padding:32px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e0d8;">
      <div style="background:#0f0f0f;padding:24px;text-align:center;">
        <span style="color:#d4af37;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Occasion de Luxe</span>
        <div style="color:#ffffff;font-size:10px;letter-spacing:4px;text-transform:uppercase;margin-top:4px;">PJ International</div>
      </div>
      <div style="padding:32px 28px;color:#1a1a1a;font-size:14px;line-height:1.6;">
        <h1 style="font-size:18px;margin:0 0 16px;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:16px 28px;border-top:1px solid #e5e0d8;color:#9a9a9a;font-size:11px;">
        Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
      </div>
    </div>
  </div>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#0f0f0f;color:#ffffff;text-decoration:none;font-size:12px;letter-spacing:1px;text-transform:uppercase;">${label}</a>`;
}

export function welcomeTemplate(displayName: string): { subject: string; html: string } {
  return {
    subject: 'Bienvenue chez Occasion de Luxe — PJ International',
    html: layout(
      `Bienvenue, ${displayName} !`,
      `<p>Votre compte a bien été créé. Vous pouvez dès maintenant parcourir notre sélection de pièces de luxe authentifiées.</p>
       ${button(FRONTEND_URL, 'Découvrir le catalogue')}`,
    ),
  };
}

export function magicLinkTemplate(link: string): { subject: string; html: string } {
  return {
    subject: 'Votre lien de connexion — Occasion de Luxe',
    html: layout(
      'Votre lien de connexion',
      `<p>Cliquez sur le bouton ci-dessous pour vous connecter. Ce lien est valable 15 minutes et à usage unique.</p>
       ${button(link, 'Se connecter')}
       <p style="margin-top:16px;color:#666;font-size:12px;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>`,
    ),
  };
}

export function orderConfirmationTemplate(params: {
  displayName: string;
  orderId: string;
  total: number;
  items: { name: string; qty: number; unitPrice: number }[];
}): { subject: string; html: string } {
  const rows = params.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;">${i.name} × ${i.qty}</td><td style="padding:6px 0;text-align:right;">${(i.unitPrice * i.qty).toFixed(2)} €</td></tr>`,
    )
    .join('');
  return {
    subject: `Confirmation de votre commande #${params.orderId.slice(0, 8)}`,
    html: layout(
      `Merci pour votre commande, ${params.displayName}`,
      `<p>Nous avons bien reçu votre commande <strong>#${params.orderId.slice(0, 8)}</strong>.</p>
       <table style="width:100%;border-collapse:collapse;margin-top:12px;">${rows}</table>
       <p style="margin-top:12px;border-top:1px solid #e5e0d8;padding-top:12px;"><strong>Total : ${params.total.toFixed(2)} €</strong></p>
       <p style="margin-top:16px;color:#666;font-size:12px;">Un seul envoi est effectué par semaine, chaque lundi. Toute commande passée le lundi après 11h00 sera expédiée le lundi suivant.</p>
       ${button(`${FRONTEND_URL}/commandes`, 'Suivre ma commande')}`,
    ),
  };
}

const STATUS_LABEL_FR: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export function orderStatusTemplate(params: { displayName: string; orderId: string; status: string }): { subject: string; html: string } {
  const label = STATUS_LABEL_FR[params.status] ?? params.status;
  return {
    subject: `Votre commande #${params.orderId.slice(0, 8)} est ${label.toLowerCase()}`,
    html: layout(
      `Mise à jour de votre commande`,
      `<p>Bonjour ${params.displayName},</p>
       <p>Votre commande <strong>#${params.orderId.slice(0, 8)}</strong> est maintenant : <strong>${label}</strong>.</p>
       ${button(`${FRONTEND_URL}/commandes`, 'Voir ma commande')}`,
    ),
  };
}

export function sellerStatusTemplate(params: { displayName: string; approved: boolean; note?: string }): { subject: string; html: string } {
  return {
    subject: params.approved ? 'Votre compte vendeur a été approuvé' : 'Votre candidature vendeur',
    html: layout(
      params.approved ? 'Candidature approuvée !' : 'Mise à jour de votre candidature',
      `<p>Bonjour ${params.displayName},</p>
       <p>${
         params.approved
           ? 'Félicitations, votre compte vendeur a été approuvé. Vous pouvez dès à présent publier vos articles.'
           : `Votre candidature vendeur n'a pas été retenue.${params.note ? ` Motif : ${params.note}` : ''}`
       }</p>
       ${button(`${FRONTEND_URL}/espace-vendeur`, params.approved ? 'Accéder à mon espace vendeur' : 'En savoir plus')}`,
    ),
  };
}
