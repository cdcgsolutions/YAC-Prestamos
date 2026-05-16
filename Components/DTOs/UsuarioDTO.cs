namespace MudApp.Components.DTOs
{
    public class UsuarioDTO
    {
        public string IdDocumento { get; set; } = string.Empty;
        public int Id { get; set; }
        public string NombreUsuario { get; set; } = string.Empty;
        public string CorreoElectronico { get; set; } = string.Empty;
        public bool EstaHabilitado { get; set; }
        public int IdRol { get; set; }
        public string Contrasena { get; set; } = string.Empty;
        public string FechaCreacion { get; set; } = string.Empty;
    }
}
