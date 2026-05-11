namespace MudApp.Components.Helpers
{
    public interface IMensajeToastr
    {
        Task MostrarMensajeErrorWithTitle(string mensaje, string titulo);
        Task MostrarMensajeExitosoWithTitle(string mensaje, string titulo);
        Task MostrarMensajeInfoWithTitle(string mensaje, string titulo);
        Task MostrarMensajeWarningWithTitle(string mensaje, string titulo);

        Task MostrarMensajeError(string mensaje);
        Task MostrarMensajeExitoso(string mensaje);
        Task MostrarMensajeInfo(string mensaje);
        Task MostrarMensajeWarning(string mensaje);

        Task ClearToastrALL();
    }
}
