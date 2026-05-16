namespace MudApp.Components.DTOs
{
    public class PagoDTO
    {
        public string IdDocumento { get; set; } = string.Empty;
        public string IdPrestamo { get; set; } = string.Empty;
        public decimal MontoAbonado { get; set; }
        public string FechaPago { get; set; } = string.Empty;
    }
}
