sing UnityEngine;
using System.Collections;

// CE SCRIPT GÉNÈRE TOUT LE JEU AU LANCEMENT
public class NanaHorrorGame : MonoBehaviour
{
    [Header("Paramètres Nana x Hello Kitty")]
    public Color murCouleur = new Color(0.1f, 0.1f, 0.1f); // Noir Gothique
    public Color solCouleur = new Color(0.6f, 0.0f, 0.0f); // Rouge Sang / Nana
    public Color lumiereCouleur = new Color(1f, 0.8f, 0.9f); // Rose pâle

    private GameObject player;
    private CharacterController controller;
    private Camera playerCam;
    private Light flashlight;
    private GameObject monster;

    // Variables de déplacement
    float xRotation = 0f;
    public float mouseSensitivity = 100f;
    public float speed = 8f;

    // État du jeu
    private bool isJumpscared = false;

    void Start()
    {
        SetupWorld();
        SetupPlayer();
        SetupMonster();
        SetupTrigger();
    }

    void Update()
    {
        if (isJumpscared) return;

        // --- GESTION VUE SOURIS ---
        float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity * Time.deltaTime;
        float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity * Time.deltaTime;

        xRotation -= mouseY;
        xRotation = Mathf.Clamp(xRotation, -90f, 90f);

        playerCam.transform.localRotation = Quaternion.Euler(xRotation, 0f, 0f);
        player.transform.Rotate(Vector3.up * mouseX);

        // --- GESTION DÉPLACEMENT ---
        float x = Input.GetAxis("Horizontal");
        float z = Input.GetAxis("Vertical");

        Vector3 move = player.transform.right * x + player.transform.forward * z;
        controller.Move(move * speed * Time.deltaTime);

        // Gravité simple
        controller.Move(Vector3.down * 9.81f * Time.deltaTime);

        // --- LAMPE TORCHE (CLIC) ---
        if (Input.GetMouseButtonDown(0))
        {
            flashlight.enabled = !flashlight.enabled;
        }
    }

    // --- CONSTRUCTION PROCÉDURALE DU NIVEAU ---
    void SetupWorld()
    {
        // 1. Sol (Damier symbolique rouge/noir)
        GameObject floor = GameObject.CreatePrimitive(PrimitiveType.Plane);
        floor.transform.localScale = new Vector3(1, 1, 4); // Couloir long
        floor.transform.position = new Vector3(0, 0, 15);
        floor.GetComponent<Renderer>().material.color = solCouleur;

        // 2. Murs et Plafond
        CreateWall(new Vector3(-5, 2.5f, 15), new Vector3(0.1f, 5, 40)); // Gauche
        CreateWall(new Vector3(5, 2.5f, 15), new Vector3(0.1f, 5, 40));  // Droite
        CreateWall(new Vector3(0, 5, 15), new Vector3(10, 0.1f, 40));   // Plafond
        CreateWall(new Vector3(0, 2.5f, 35), new Vector3(10, 5, 0.1f)); // Fond

        // 3. Ambiance (Lumière)
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
        RenderSettings.ambientLight = new Color(0.02f, 0, 0); // Ambiance très sombre rouge
    }

    void CreateWall(Vector3 pos, Vector3 scale)
    {
        GameObject wall = GameObject.CreatePrimitive(PrimitiveType.Cube);
        wall.transform.position = pos;
        wall.transform.localScale = scale;
        wall.GetComponent<Renderer>().material.color = murCouleur;
    }

    // --- CRÉATION DU JOUEUR ---
    void SetupPlayer()
    {
        player = new GameObject("Player");
        player.transform.position = new Vector3(0, 1, 0);
        controller = player.AddComponent<CharacterController>();

        // Caméra
        GameObject camObj = new GameObject("Main Camera");
        camObj.transform.parent = player.transform;
        camObj.transform.localPosition = new Vector3(0, 0.6f, 0);
        playerCam = camObj.AddComponent<Camera>();
        camObj.AddComponent<AudioListener>(); // Pour le son

        // Lampe Torche
        GameObject lightObj = new GameObject("Flashlight");
        lightObj.transform.parent = camObj.transform;
        lightObj.transform.localPosition = Vector3.zero;
        flashlight = lightObj.AddComponent<Light>();
        flashlight.type = LightType.Spot;
        flashlight.range = 20;
        flashlight.spotAngle = 40;
        flashlight.intensity = 2;
        flashlight.color = lumiereCouleur;

        // Verrouiller la souris
        Cursor.lockState = CursorLockMode.Locked;
    }

    // --- CRÉATION DU MONSTRE HELLO KITTY (VERSION CREPY) ---
    void SetupMonster()
    {
        monster = new GameObject("NanaKittyMonster");
        monster.transform.position = new Vector3(0, 0, 30); // Au bout du couloir
        monster.SetActive(false); // Caché au début

        // Tête (Ovale blanc)
        GameObject head = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        head.transform.parent = monster.transform;
        head.transform.localPosition = new Vector3(0, 1.5f, 0);
        head.transform.localScale = new Vector3(1.2f, 1f, 1f);

        // Oreilles (Cubes tournés)
        CreateEar(new Vector3(-0.4f, 2.1f, 0), 30);
        CreateEar(new Vector3(0.4f, 2.1f, 0), -30);

        // Yeux (Noirs vides)
        CreateEye(new Vector3(-0.3f, 1.5f, 0.45f));
        CreateEye(new Vector3(0.3f, 1.5f, 0.45f));

        // Le Noeud "Nana" (Rouge Punk)
        GameObject bow = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        bow.transform.parent = monster.transform;
        bow.transform.localPosition = new Vector3(0.4f, 1.9f, 0.2f);
        bow.transform.localScale = new Vector3(0.4f, 0.4f, 0.2f);
        bow.GetComponent<Renderer>().material.color = Color.red;

        // Corps (Robe noire gothique)
        GameObject body = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        body.transform.parent = monster.transform;
        body.transform.localPosition = new Vector3(0, 0.5f, 0);
        body.GetComponent<Renderer>().material.color = Color.black;
    }

    void CreateEar(Vector3 pos, float zRot)
    {
        GameObject ear = GameObject.CreatePrimitive(PrimitiveType.Cube); // Faute de cône facile
        ear.transform.parent = monster.transform;
        ear.transform.localPosition = pos;
        ear.transform.localScale = new Vector3(0.3f, 0.3f, 0.3f);
        ear.transform.localRotation = Quaternion.Euler(0, 0, zRot);
    }

    void CreateEye(Vector3 pos)
    {
        GameObject eye = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        eye.transform.parent = monster.transform;
        eye.transform.localPosition = pos;
        eye.transform.localScale = new Vector3(0.15f, 0.2f, 0.1f);
        eye.GetComponent<Renderer>().material.color = Color.black;
    }

    // --- LE TRIGGER JUMPSCARE ---
    void SetupTrigger()
    {
        GameObject trig = new GameObject("JumpscareTrigger");
        trig.transform.position = new Vector3(0, 1, 20); // Milieu du couloir
        BoxCollider box = trig.AddComponent<BoxCollider>();
        box.isTrigger = true;
        box.size = new Vector3(5, 5, 1);

        // On attache un petit script de détection à cet objet
        JumpscareListener listener = trig.AddComponent<JumpscareListener>();
        listener.mainScript = this;
    }

    // Fonction publique appelée par le Trigger
    public void TriggerJumpscare()
    {
        if (isJumpscared) return;
        isJumpscared = true;

        // Faire apparaitre le monstre juste devant la caméra
        monster.SetActive(true);
        monster.transform.position = player.transform.position + player.transform.forward * 1.5f;
        monster.transform.LookAt(player.transform);

        // Lumière rouge sang
        flashlight.color = Color.red;
        flashlight.intensity = 5f;

        // Son (simulation via code : changement de hauteur de ton pour effet effrayant)
        AudioSource source = player.AddComponent<AudioSource>();
        source.pitch = 0.5f; // Son grave et lent
                             // Note: En vrai projet, ici on joue un clip audio. 
                             // Comme je ne peux pas donner de fichier MP3, imagine un son strident ici.

        Debug.Log("JUMPSCARE ! HELLO KITTY NANA STYLE !");
    }
}

// Petit script utilitaire pour détecter la collision
public class JumpscareListener : MonoBehaviour
{
    public NanaHorrorGame mainScript;
    void OnTriggerEnter(Collider other)
    {
        if (mainScript != null) mainScript.TriggerJumpscare();
    }
}