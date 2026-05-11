namespace MudApp.Components.Models
{
    public class DatosUsuario
    {
        public string? Id { get; set; }
        public string? NombreUsuario { get; set; }
        public string? CorreoElectronico { get; set; }
    }

    public class ResultadoUsuario
    {
        public bool Exito { get; set; }
        public DatosUsuario? Datos { get; set; }
        public string? Mensaje { get; set; }
    }
}
