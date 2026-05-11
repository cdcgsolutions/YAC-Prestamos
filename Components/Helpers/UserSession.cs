namespace MudApp.Components.Helpers
{
    public class UserSession
    {
        public bool IsAuthenticated { get; private set; }
        public string? Uid { get; private set; }

        public void SetSession(string uid)
        {
            IsAuthenticated = true;
            Uid = uid;
        }

        public void ClearSession()
        {
            IsAuthenticated = false;
            Uid = null;
        }
    }
}
