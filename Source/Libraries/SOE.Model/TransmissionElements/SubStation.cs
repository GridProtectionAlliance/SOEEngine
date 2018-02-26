using GSF.Data.Model;

namespace SOE.Model
{
    public class SubStation
    {
        [PrimaryKey(true)]
        public int ID { get; set; }
        public string Name { get; set; }
    }
}
