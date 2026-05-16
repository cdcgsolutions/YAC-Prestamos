namespace MudApp.Components.DTOs
{
    public class ClienteDTO
    {
        public string IdDocumento { get; set; } = string.Empty;
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public DateTime? FechaNacimiento { get; set; }
        public string EstadoCivil { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public string Celular { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string FechaRegistro { get; set; } = string.Empty;
        public bool EstaHabilitado { get; set; }
    }
}
