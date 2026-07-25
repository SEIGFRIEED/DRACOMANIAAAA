// Pega este correo donde quieres recibir las ordenes de la tienda.
const DESTINO = "tu-correo@gmail.com";

function doPost(e) {
  try {
    const order = JSON.parse(e.postData.contents);

    const items = (order.items || [])
      .map(item => `${item.quantity}x ${item.name} (${item.size}) - RD$${item.total}`)
      .join("\n");

    const body = `
Nueva orden DRACOMANIA

Orden: ${order.orderNumber}
Estado: ${order.status}

Cliente:
Nombre: ${order.customer.name}
Correo: ${order.customer.email}
Telefono: ${order.customer.phone}
Direccion: ${order.customer.address}
Ciudad: ${order.customer.city}
Pais: ${order.customer.country}
Codigo postal: ${order.customer.zip}

Productos:
${items}

Subtotal: RD$${order.subtotal}
Envio: RD$${order.shipping}
Total: RD$${order.total}
`.trim();

    MailApp.sendEmail({
      to: DESTINO,
      subject: `Nueva orden ${order.orderNumber} - DRACOMANIA`,
      body,
      replyTo: order.customer.email,
      name: "DRACOMANIA SHOP",
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Solo para verificar rapido en el navegador que el deploy quedo activo.
function doGet() {
  return ContentService.createTextOutput("DRACOMANIA order endpoint activo.");
}
