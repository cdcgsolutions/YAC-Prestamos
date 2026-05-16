namespace MudApp.Components.DTOs
{
    public class PrestamoDTO
    {
        public string IdDocumento { get; set; } = string.Empty;
        public int Id { get; set; }
        public int IdCliente { get; set; }
        public string NombreCliente { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public decimal PorcentajeInteres { get; set; }
        public decimal MontoTotal { get; set; }
        public decimal SaldoPendiente { get; set; }
        public string ModalidadCobro { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string FechaRegistro { get; set; } = string.Empty;
    }
}
