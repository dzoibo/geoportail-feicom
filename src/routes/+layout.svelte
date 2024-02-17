<script lang="ts">
  import '../app.postcss';
  import { page } from '$app/stores';
  import { onMount, createEventDispatcher } from 'svelte';
  import Main from '../components/Map.svelte';
  import Papa from 'papaparse';
  // Autre fichier, par exemple, votre composant ou page
  import {
    uniqueValues,
    findMinMax,
    jsonToItem,
    removeDuplicatesByAttribute
  } from '../../shared/utilitaire';
  import SearchBar from '../components/SearchBar.svelte';
  import {
    dataStore,
    rangeValue,
    buttonICSP,
    rangeValueAccord,
    storeIndicateur5,
    storeIndicateur,
    heightNavBar,
    storeIndicateurICSP
  } from '../../shared/store.js';
  import { fetchData } from '../../shared/dataService.js';

  import {
    Navbar,
    NavBrand,
    NavLi,
    NavUl,
    NavHamburger,
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    Drawer,
    CloseButton,
    SidebarDropdownWrapper,
    Button,
    Dropdown,
    Checkbox,
    ButtonGroup,
    Range,
    Radio,
    Label,
    Tabs,
    TabItem,
    Spinner
  } from 'flowbite-svelte';
  import {
    FolderOutline,
    SwatchbookOutline,
    LandmarkOutline,
    DollarOutline,
    UsersGroupOutline,
    ChevronDownSolid,
    CheckPlusCircleOutline,
    CalendarMonthOutline,
    UserAddOutline,
    UserOutline,
    UsersOutline,
    InfoCircleSolid,
    OrdoredListOutline
  } from 'flowbite-svelte-icons';
  import { Cog } from 'svelte-heros-v2';
  import { sineIn } from 'svelte/easing';

  let transitionParams = {
    x: -320,
    duration: 100,
    easing: sineIn
  };
  let breakPoint: number = 1024;
  let width: number;
  let height: number;
  let component;
  let props;
  let backdrop: boolean = false;
  let drawerHidden = true;
  let activateClickOutside = true;

  let navbarHeight = 0;

  let sidebarWidth = 20;
  let marginRight = sidebarWidth; // Valeur initiale de la marge droite

  let dataArr: any[] = [];
  let mandatData: any[] = [];
  let communeData: any[] = [];
  let uniqueBeneficiaireForIDFetch: any[] = [];
  let icspData: any[] = [];
  let valeursAttribution: any[] = [];
  let valeursDomaine: any[] = [];
  let valeursSecteur: any[] = [];
  let valeursBeneficiaire: any[] = [];
  let valeursBeneficiaire2: any[] = [];
  let valeursSourcefinancement: any[] = [];
  let valeursDepartement: any[] = [];
  let valeursRegion: any[] = [];
  let valeursAvancement: any[] = [];
  let valeursPartenaires: any[] = [];
  let arrayAllIndicateurs = { accord: [], icsp: [] };
  let arrayAllIndicateursICSP: any[] = [];
  let loadingData = true;
  let isItCoop = '';
  let activeUrl;
  let showFinancement = false;
  let showICSP = true;
  let minMaxYear: {
    max: 2022;
    min: 2023;
  };
  let minMaxYearAccord = {
    min: 2022,
    max: 2023
  };

  let valueSliderAccord = [minMaxYearAccord.min, minMaxYearAccord.max];

  let minMaxYearICSP = {
    min: 2022,
    max: 2023
  };

  let valueSlideICSP = [minMaxYearICSP.min, minMaxYearICSP.max];

  let valueSliderLanding = 0;

  let valueSliderAccord2 = 0;
  let update = true;

  let showProgressBar = true; // Définiir la variable pour afficher la barre de progression
  let progressValue = 0; // Initialiser la valeur de la progression
  let minSliderValue = minMaxYearAccord.min;
  let maxSliderValue = minMaxYearAccord.max;
  let minSliderICSP = minMaxYearICSP.min;
  let maxSliderICSP = minMaxYearICSP.max;

  let checkedOptions: { [key: string]: boolean } = {};
  //Liste déroulante et search bar
  //accord
  let inputValue = '';
  let indicateur5 = 'Source_financement';
  let indicateur1 = "Instance d'attribution";
  let indicateur2 = 'Secteurs';
  let indicateur3 = 'Domaines';
  let indicateur4 = 'Bénéficiaire';
  let indicateur8 = 'Département';
  let indicateur9 = 'Région';
  let indicateur6 = 'Partenaires';
  let indicateur10 = 'Niveau d’avancement';

  //ICSP
  let indicateur7 = 'COMMUNE';

  //searchResult
  let regionSearchResult:any[]=[];
  let departementSearchResult:any[]=[];
  let beneficiaireAccordSearchResult: any[]=[];
  let beneficiaireIcspSearchResult:any[]=[];

  //filter indicator¸
  let regionInputValue='';
  let departementInputValue='';
  let beneficiaireAccordInputValue='';
  let beneficiareIcspInputValue='';
  let instanceInputValue='';
  let secteurInputValue='';
  let domaineInputValue='';
  let sourceFInputValue='';

  //Accord
  let dropdownSelectionIndicateur10 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur9 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur8 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur7 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur6 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur5 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur4 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur3 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur2 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur1 = { indicateur: '', data: [] };
  let dropdownSelectionsAll: any[] = [];

  let cardForSideBar =
    'relative bg-white dark:bg-#23409A-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md p-2 mb-2';
  let filterIndicatorStyle='w-2.5 h-2.5 mb-2 rounded-[50%] bg-[#234099]'
  let dropdownStyle = 'w-48 overflow-y-auto py-1 h-48';

  let theme='info';
  //variables to handle the filter indicator for each filter
  let accordFilterIndicators={
    region:false,
    secteur:false,
    domaine:false,
    sourceF:false,
    instance:false,
    partenaire:false,
    departement:false,
    beneficiaire:false,
    niveauAvancement:false
  }

  let icspFilterIndicator={
    beneficiaire: false
   }

  

  let filterCheckedAll={
    region:false,
    secteur:false,
    domaine:false,
    sourceF:false,
    instance:false,
    partenaire:false,
    departement:false,
    beneficiaireIcsp:false,
    beneficiaireAccord: false,
  }
  

  onMount(async function () {
    try {
      const { mandatData, dataArr, icspData, communeData } = await fetchData();

      // Mettre à jour les propriétés individuelles du store
      dataStore.update((store) => {
        loadingData = false;
        store.icspData = icspData;
        store.dataArr = dataArr;
        store.mandatData = mandatData;
        store.communeData = communeData;

        return store;
      });

      valeursAttribution = uniqueValues(dataArr, indicateur1);
      valeursSecteur = uniqueValues(dataArr, indicateur2,true,'id_SECTEUR');
      valeursDomaine = uniqueValues(dataArr, indicateur3,true);
      valeursBeneficiaire = uniqueValues(dataArr, indicateur4, true, 'id_COMMUNE');
      valeursBeneficiaire2 = uniqueValues(icspData, indicateur7, true, 'id_COMMUNE');
      valeursSourcefinancement = uniqueValues(dataArr, indicateur5);
      valeursPartenaires = uniqueValues(dataArr, indicateur6);
      valeursDepartement = uniqueValues(dataArr, indicateur8, true, 'id_DEPARTEMENT');
      valeursRegion = uniqueValues(dataArr, indicateur9, false, 'id_REGION');
      valeursAvancement = uniqueValues(dataArr, indicateur10);
      // Fusionner les deux tableaux en un seul
      const mergedArray = [...valeursBeneficiaire, ...valeursBeneficiaire2];

      let uniqueBeneficiaireForIDFetch = removeDuplicatesByAttribute(mergedArray, 'id_COMMUNE');
      // Mettre à jour les propriétés individuelles du store
      dataStore.update((store) => {
        store.keyCommuneID_Commune = uniqueBeneficiaireForIDFetch;
        return store;
      });
      //ICSP
      dropdownSelectionIndicateur7.indicateur = indicateur7;
      // ACCORD
      dropdownSelectionIndicateur9.indicateur = indicateur10;
      dropdownSelectionIndicateur9.indicateur = indicateur9;
      dropdownSelectionIndicateur8.indicateur = indicateur8;
      dropdownSelectionIndicateur6.indicateur = indicateur6;
      dropdownSelectionIndicateur5.indicateur = indicateur5;
      dropdownSelectionIndicateur4.indicateur = indicateur4;
      dropdownSelectionIndicateur3.indicateur = indicateur3;
      dropdownSelectionIndicateur2.indicateur = indicateur2;
      dropdownSelectionIndicateur1.indicateur = indicateur1;

      // Ajouter les objets à l'array dropdownSelections
      dropdownSelectionsAll.push(
        dropdownSelectionIndicateur10,
        dropdownSelectionIndicateur9,
        dropdownSelectionIndicateur8,
        dropdownSelectionIndicateur7,
        dropdownSelectionIndicateur6,
        dropdownSelectionIndicateur5,
        dropdownSelectionIndicateur4,
        dropdownSelectionIndicateur3,
        dropdownSelectionIndicateur2,
        dropdownSelectionIndicateur1
      );

      // Slider
      minMaxYearICSP = findMinMax(icspData, 'ANNEE');
      minMaxYearAccord = findMinMax(dataArr, 'Année financement');

      valueSliderAccord = [minMaxYearAccord.min, minMaxYearAccord.max];
      valueSlideICSP = [minMaxYearICSP.min, minMaxYearICSP.max];
      rangeValue.set(valueSlideICSP);
      rangeValueAccord.set(valueSliderAccord);

      // Sélectionner l'élément du drawer par son identifiant
      const drawer = document.getElementById('sidebar');
      const navbar = document.getElementById('myNavbar'); // Remplacer 'navbar' par l'ID réel de votre navbar

      if (navbar) {
        navbarHeight = navbar.clientHeight;
        heightNavBar.set(navbarHeight);
      }
    } catch (error) {
      console.error(error);
    }

    loadData();
  });

  onMount(() => {
    if (width >= breakPoint) {
      drawerHidden = false;
      activateClickOutside = false;
    } else {
      drawerHidden = true;
      activateClickOutside = false;
    }
  });

  const toggleDrawer = () => {
    drawerHidden = !drawerHidden;
    if (drawerHidden) {
      marginRight = 0;
    } else {
      marginRight = 20;
    }
  };

  $: if (width >= breakPoint) {
    drawerHidden = false;
    activateClickOutside = false;
  } else {
    drawerHidden = false;
    activateClickOutside = false;
  }

  function toggleCheckbox(
    checkedOptions: { checked: boolean },
    array: { indicateur: string; data: never[] },
    unique: any[],
    section: string,
  ) {
    checkedOptions.checked = !checkedOptions.checked;
    updateSelectedWords(array, unique, section); // Mettre à jour les mots sélectionnés
    setTimeout(() => {
      updateFilterIndicator(array.indicateur,section)
    }, 12);
    
  }

  function toggleAllCheckbox(
   filter: string
  ){
    let checkedAllfilter=false;
    filterCheckedAll[filter] = !filterCheckedAll[filter];
    checkedAllfilter=filterCheckedAll[filter] ;
     /**
      * since the flow-bite checkbox component is wrapping the checkbox itself inside a label,
      * we have to target the input inside the checkbox before checking it and dispach the event
     */
     let checkboxes= document.querySelectorAll("."+filter+"-checkbox input");

     checkboxes.forEach(function(checkbox: any) {
      // this condition is to make sure that we check and trigger the event only if the item is not yet checked or we are unchecking
      if(checkbox.checked!== true || !checkedAllfilter){
        checkbox.checked = checkedAllfilter;
        checkbox.dispatchEvent(new Event('change'));
      }
        
    });
      
    setTimeout(() => {// this is to restore the value changed in the function updateFilterIndicator()
        filterCheckedAll[filter] =checkedAllfilter;
    }, 12);
    
  }
 
  /**   
   * function to update the filter indicator
  */
  function updateFilterIndicator(indicateur: string,section: string){
    if(section==='icsp'){
      const arrayIcspLength=arrayAllIndicateurs.icsp[0].data.length;

      icspFilterIndicator.beneficiaire=arrayIcspLength>0 // we use only the fisrt item in the array because tyhe icsp section has only one filter actually
      var AllBeneficiaireIcspCheckBox:any = document.querySelector(".beneficiaireIcsp-all-checkbox");
      if (AllBeneficiaireIcspCheckBox){
        AllBeneficiaireIcspCheckBox.checked = valeursBeneficiaire2.length===arrayIcspLength;
      }
      filterCheckedAll.beneficiaireIcsp=valeursBeneficiaire2.length===arrayIcspLength;
    }else{
      const indicateurIndex = arrayAllIndicateurs.accord.findIndex((item:any)=>item.indicateur===indicateur)
      const arrayAccordLength=arrayAllIndicateurs.accord[indicateurIndex].data.length;
      switch(indicateur) {
        case 'Région':
            let AllRegioncheckBox:any = document.querySelector(".region-all-checkbox");
            if (AllRegioncheckBox) {
              AllRegioncheckBox.checked = valeursRegion.length===arrayAccordLength;
            }
            filterCheckedAll.region=valeursRegion.length===arrayAccordLength;
            accordFilterIndicators.region=arrayAccordLength>0;
          break;

        case 'Département':
          accordFilterIndicators.departement=arrayAccordLength>0;
          let AllDepartementcheckBox:any = document.querySelector(".departement-all-checkbox");
          if (AllDepartementcheckBox) {
            AllDepartementcheckBox.checked = valeursDepartement.length===arrayAccordLength;
          }
          filterCheckedAll.departement=valeursDepartement.length===arrayAccordLength;
          break;
        case 'Bénéficiaire':
          accordFilterIndicators.beneficiaire=arrayAccordLength>0;
          let AllBeneficiciareCheckBox:any = document.querySelector(".beneficiaireAccord-all-checkbox");
          if (AllBeneficiciareCheckBox) {
            AllBeneficiciareCheckBox.checked = valeursBeneficiaire.length===arrayAccordLength;
          }
          filterCheckedAll.beneficiaireAccord=valeursBeneficiaire.length===arrayAccordLength
          break;
        case "Instance d'attribution":
          accordFilterIndicators.instance=arrayAccordLength>0;
          let AllInstanceCheckBox:any = document.querySelector(".instance-all-checkbox");
          if (AllInstanceCheckBox) {
            AllInstanceCheckBox.checked = valeursAttribution.length===arrayAccordLength;
          }
          filterCheckedAll.instance=valeursAttribution.length===arrayAccordLength
          break;
        case 'Secteurs':
          accordFilterIndicators.secteur =arrayAccordLength>0;
          let AllSecteurCheckBox:any = document.querySelector(".secteur-all-checkbox");
          if(AllSecteurCheckBox) {
            AllSecteurCheckBox.checked = valeursSecteur.length===arrayAccordLength;
          }
          filterCheckedAll.secteur=valeursSecteur.length===arrayAccordLength;
          break;
        case 'Domaines':
          accordFilterIndicators.domaine=arrayAccordLength>0;
          let AllDomaineCheckBox:any = document.querySelector(".domaine-all-checkbox");
          if(AllDomaineCheckBox){
            AllDomaineCheckBox.checked = valeursDomaine.length===arrayAccordLength;
          }
          filterCheckedAll.domaine=valeursDomaine.length===arrayAccordLength;
          break;
        case 'Source_financement':
          accordFilterIndicators.sourceF=arrayAccordLength>0;
          let AllSourceFCheckBox:any = document.querySelector(".sourceF-all-checkbox");
          if(AllSourceFCheckBox){
            AllSourceFCheckBox.checked = valeursSourcefinancement.length===arrayAccordLength;
          }
          filterCheckedAll.sourceF=valeursDomaine.length===arrayAccordLength;
          break;
        case 'Partenaires':
          accordFilterIndicators.partenaire=arrayAccordLength>0;
          let AllPartenaireCheckBox:any = document.querySelector(".partenaire-all-checkbox");
          if(AllPartenaireCheckBox){
            AllPartenaireCheckBox.checked = valeursPartenaires.length===arrayAccordLength;
          }
          filterCheckedAll.partenaire=valeursDomaine.length===arrayAccordLength;
          break;
        default:// this is the filter niveau d'avancement , we don't need a searchBar here
          accordFilterIndicators.niveauAvancement=arrayAccordLength>0;
      }
    }
  }
  function updateSelectedWords(
    array: { indicateur: string; data: never[] } | undefined,
    unique: any[],
    section: string,
    option = false
  ) {
    update = true;
    //@ts-ignore
    setTimeout(() => {
      //Todo Automatisation pour prendre toutes les données des listes déroulantes.
      array.data = unique.filter((unique) => unique.checked).map((unique) => unique.key);
      // Vérifiez si un objet avec le même indicateur existe déjà dans arrayAllIndicateurs
      const existingIndicateurIndex = arrayAllIndicateurs[section].findIndex(
        (item) => item.indicateur === array.indicateur
      );
      if (existingIndicateurIndex !== -1) {
        // Mettez à jour 'data' de l'objet existant
        arrayAllIndicateurs[section][existingIndicateurIndex].data = array.data;
      } else {
        // Ajoutez un nouvel objet à arrayAllIndicateurs
        arrayAllIndicateurs[section].push(array);
      }

      update = false;
    }, 10);

    return array;
  }

  function closeDiv(
    wordToRemove: any,
    array: { indicateur: string; data: never[] } | undefined,
    unique,
    section
  ) {
    // Trouver l'objet correspondant dans valeursSourcefinancement
    const word = unique.find((value) => value.key === wordToRemove);

    if (word) {
      word.checked = false;
    }

    updateSelectedWords(array, unique, section); // Mettre à jour les mots sélectionnés
    
    if(array!==undefined){
      setTimeout(() => {
        updateFilterIndicator(array.indicateur,section)
      }, 12);
    }
  }

  $: {
    if (minSliderValue <= maxSliderValue) {
      minSliderValue = minSliderValue;
    } else {
      minSliderValue = maxSliderValue;
    }
    if (maxSliderValue >= minSliderValue) {
      maxSliderValue = maxSliderValue;
    } else {
      maxSliderValue = minSliderValue;
    }
    if (minSliderICSP <= maxSliderICSP) {
      minSliderICSP = minSliderICSP;
    } else {
      minSliderICSP = maxSliderICSP;
    }
    if (maxSliderICSP >= minSliderICSP) {
      maxSliderICSP = maxSliderICSP;
    } else {
      maxSliderICSP = minSliderICSP;
    }

    valueSliderAccord = [minSliderValue, maxSliderValue];
    valueSlideICSP = [minSliderICSP, maxSliderICSP];
    //@ts-ignore
    rangeValue.set(valueSlideICSP);
    //@ts-ignore
    rangeValueAccord.set(valueSliderAccord);

    activeUrl = $page.url.pathname;
    let spanClass = 'pl-2 self-center text-md text-gray-900 dark:text-white';
    let divClass = 'w-full md:block md:w-auto pr-8';
    let ulClass =
      'flex flex-col p-4 mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-lg md:font-medium';

    storeIndicateur.update((items) => {
      //@ts-ignore
      items = arrayAllIndicateurs;
      return items;
    });
    storeIndicateurICSP.update((items) => {
      //@ts-ignore
      items = arrayAllIndicateursICSP;
      return items;
    });

    update = update;
  }
  async function loadData() {
    // Téléchargez votre data ici
    // Une fois la data téléchargée, masquez la barre de progression
    showProgressBar = false;
  }

  const handleInput = (event,data,filter) => {
    const value = event.target.value;
    const filteredData= data.filter((item) =>
      item.toLowerCase().match(value.toLowerCase())
    );
    switch(filter) {
      case 'region':
        regionSearchResult=filteredData
        break;
      case 'departement':
        departementSearchResult=filteredData
        break;
      case 'beneficiaireAccord':
      beneficiaireAccordSearchResult=filteredData
        break;
      default:
      beneficiaireIcspSearchResult=filteredData
    } 
  };

  function filterBeneficiaires(beneficiaires, filteredItems) {
    return filteredItems.length === 0 || filteredItems.includes(beneficiaires.key);
  }

  // Fonction pour réinitialiser les filtres et vider les dropdowns
  function resetFilters() {
    // Réinitialiser les filtres
    arrayAllIndicateurs = { accord: [], icsp: [] };
    // Vider les dropdowns en réinitialisant les valeurs
    valeursAttribution.forEach((attribution) => (attribution.checked = false));
    valeursSecteur.forEach((secteur) => (secteur.checked = false));
    valeursDomaine.forEach((domaine) => (domaine.checked = false));
    valeursBeneficiaire.forEach((beneficiaire) => (beneficiaire.checked = false));
    valeursBeneficiaire2.forEach((beneficiaire) => (beneficiaire.checked = false));
    valeursSourcefinancement.forEach((financement) => (financement.checked = false));
    valeursPartenaires.forEach((partenaire) => (partenaire.checked = false));
    valeursDepartement.forEach((departement) => (departement.checked = false));
    valeursRegion.forEach((region) => (region.checked = false));
    valeursAvancement.forEach((avancement) => (avancement.checked = false));
    clearIndicator();
  }

  function clearIndicator(){
    if(theme==='icsp'){
      icspFilterIndicator.beneficiaire=false;
    }else{
      accordFilterIndicators.region=false,
      accordFilterIndicators.secteur=false,
      accordFilterIndicators.domaine=false,
      accordFilterIndicators.sourceF=false,
      accordFilterIndicators.instance=false,
      accordFilterIndicators.partenaire=false,
      accordFilterIndicators.departement=false,
      accordFilterIndicators.beneficiaire=false,
      accordFilterIndicators.niveauAvancement=false
    }
  }
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />
<Navbar id="myNavbar" let:hidden let:toggle class="navbar">
  <NavHamburger
    onClick={toggleDrawer}
    btnClass="ml-3"
    class="{drawerHidden == true ? 'rotate-90' : ''} mx-none  justify-none"
    style="display:block"
  />
  <NavBrand href="/" class="lg:ml-64">
    <img src={'/logo-Feicom.png'} alt="Feicom" class=" max-w-full h-11" />
    <span class="self-center whitespace-nowrap text-xl poppins-medium text-white pl-4">
      Géoportail du FEICOM
    </span>
  </NavBrand>
  <!--   <NavHamburger on:click={toggle} />
 <NavUl {hidden} {divClass} {ulClass}>
    <NavLi href="/">Home</NavLi>
    <NavLi href="/pages/about">About</NavLi>
    <NavLi href="https://github.com/shinokada/flowbite-sveltekit-responsive-sidebar-layout"
      >GitHub</NavLi
    >
  </NavUl> -->
</Navbar>
{#if !loadingData}
  <Drawer
    style="top: {navbarHeight}px !important; width:{sidebarWidth}rem !important;"
    transitionType="fly"
    {backdrop}
    {transitionParams}
    bind:hidden={drawerHidden}
    bind:activateClickOutside
    class="overflow-y-auto pb-32 !p-0 sidebar"
    id="sidebar"
  >
    <div class="h-full w-full bg-[#00862b14]">
      <Sidebar asideClass="w-54">
        <!-- Bouton Reset Filter -->

        <SidebarWrapper divClass="overflow-y-auto" style=" overflow-x: hidden">
          <Tabs style="full" >
            <TabItem
              class="text-xs poppins-medium w-full !border-b  !border-gray-200 "
              open
              on:click={()=>{
                showICSP=true;
                showFinancement= false;
                theme='info';
                buttonICSP.set('info');
              }}
            >
              <div slot="title" class="flex px-2.5 items-center gap-0.5">
                <LandmarkOutline size="sm" />
                <span class="-ml-2">Informations générales des territoires</span>
              </div>
            </TabItem>
            <div class="space-x-0 w-full flex !flex-nowrap">
              <TabItem
                class="text-xs poppins-medium w-full !border-r !border-gray-200  "
                on:click={() => {
                  showICSP = true;
                  showFinancement = false;
                  theme='icsp';
                  buttonICSP.set('icsp');
                }}
              >
                <div slot="title" class="flex items-center gap-1 !rounded-none">
                  <DollarOutline size="sm" />
                  Finance locale
                </div>
                <SidebarGroup class={cardForSideBar} id="icsp">
                  <SidebarDropdownWrapper label="Années">
                    <svelte:fragment slot="icon">
                      <CalendarMonthOutline
                        class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                      />
                    </svelte:fragment>
                    <div class="flex items-center">
                      <p>
                        Visualisation des données pour la période : {minSliderICSP +
                          ' - ' +
                          maxSliderICSP}
                      </p>
                    </div>

                    <div class="flex items-center space-x-4">
                      <div class="flex-1">
                        <Range
                          class="!rounded-none"
                          id="range-max"
                          min={minMaxYearICSP.min}
                          max={minMaxYearICSP.max}
                          bind:value={minSliderICSP}
                          step="1"
                        />
                      </div>
                      <div class="flex-1">
                        <Range
                          class="!rounded-none"
                          id="range-min"
                          min={minMaxYearICSP.min}
                          max={minMaxYearICSP.max}
                          bind:value={maxSliderICSP}
                          step="1"
                        />
                      </div>
                    </div>
                  </SidebarDropdownWrapper>
                </SidebarGroup>
                <SidebarGroup class={cardForSideBar} >
                  <SidebarDropdownWrapper label="Bénéficiaire">
                    <svelte:fragment slot="icon">
                      <UsersGroupOutline
                        class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                      /> 
                      {#if icspFilterIndicator.beneficiaire && !filterCheckedAll.beneficiaireIcsp}
                        <div class={filterIndicatorStyle} ></div>
                      {/if}
                    </svelte:fragment>
                    <Button class="bg-[#234099] hover:bg-[#182D73]"
                      >Sélection des bénéficiaires<ChevronDownSolid
                        class="w-3 h-3 ms-2 text-white dark:text-white"
                      /></Button
                    >
                    <Dropdown class={dropdownStyle}>
                      <div slot="header" class="p-3">
                        <SearchBar
                            bind:inputValue={beneficiareIcspInputValue}
                            on:input={(event) => handleInput(event,jsonToItem({ valeursBeneficiaire2 }, 'valeursBeneficiaire2'),'beneficiaireIcsp')}
                        />
                      </div>
                      {#if beneficiareIcspInputValue.length===0}
                        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                          <Checkbox
                            class="beneficiaireIcsp-all-checkbox"
                            checked={filterCheckedAll.beneficiaireIcsp}
                            on:change={() =>
                              toggleAllCheckbox("beneficiaireIcsp")
                            }>Tout sélectionner</Checkbox
                          >
                        </li>
                      {/if}
                      
                      {#each valeursBeneficiaire2 as beneficiaires}
                        {#if filterBeneficiaires(beneficiaires, beneficiaireIcspSearchResult)}
                          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Checkbox class="beneficiaireIcsp-checkbox"
                              id={beneficiaires.id_COMMUNE}
                              checked={beneficiaires.checked}
                              on:change={() =>
                                toggleCheckbox(
                                  beneficiaires,
                                  dropdownSelectionIndicateur7,
                                  valeursBeneficiaire2,
                                  'icsp'
                                )}>{beneficiaires.key}</Checkbox
                            >
                          </li>
                        {/if}
                      {/each}
                    </Dropdown>
                    <div class="px-2 pt-1 pb-2">
                      {#if arrayAllIndicateurs.icsp}
                        {#each arrayAllIndicateurs.icsp as indicateur}
                          {#if indicateur.indicateur === dropdownSelectionIndicateur7.indicateur}
                            {#each indicateur.data as word (word)}
                              <div 
                                class="inline-flex relative px-5 py-2.5 m-1 font-medium text-center text-sm text-white bg-[#0095DC] rounded-lg"
                              >
                                {word}
                                <CloseButton
                                  on:click={() =>
                                    closeDiv(
                                      word,
                                      dropdownSelectionIndicateur7,
                                      valeursBeneficiaire2,
                                      'icsp'
                                    )}
                                  class=" absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 !h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                                />
                              </div>
                            {/each}
                          {/if}
                        {/each}
                      {/if}
                    </div>
                  </SidebarDropdownWrapper>
                </SidebarGroup>
              </TabItem>

              <!--   ACCORD DE FINANCEMENT -->
              <TabItem
                class="text-xs poppins-medium   w-full"
                on:click={() => {
                  showICSP = false;
                  showFinancement = true;
                  theme='accord';
                  buttonICSP.set('accord');
                }}
              >
                <div slot="title" class="flex items-center gap-1">
                  <CheckPlusCircleOutline size="sm" />
                  Appuis financiers
                </div>
                <SidebarGroup id="finance">
                  <SidebarGroup class={cardForSideBar}>
                    <SidebarDropdownWrapper label="Années">
                      <svelte:fragment slot="icon">
                        <CalendarMonthOutline
                          class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                        />
                      </svelte:fragment>
                      <div class="flex items-center">
                        <p>
                          Visualisation des données pour la période : {minSliderValue +
                            ' - ' +
                            maxSliderValue}
                        </p>
                      </div>

                      <div class="flex items-center space-x-4">
                        <div class="flex-1">
                          <Range
                            class="!rounded-none"
                            id="range-max"
                            min={minMaxYearAccord.min}
                            max={minMaxYearAccord.max}
                            bind:value={minSliderValue}
                            step="1"
                          />
                        </div>
                        <div class="flex-1">
                          <Range
                            class="!rounded-none"
                            id="range-min"
                            min={minMaxYearAccord.min}
                            max={minMaxYearAccord.max}
                            bind:value={maxSliderValue}
                            step="1"
                          />
                        </div>
                      </div>
                    </SidebarDropdownWrapper>
                  </SidebarGroup>
                  <SidebarGroup class={cardForSideBar}>
                    <SidebarDropdownWrapper label="Région">
                      <svelte:fragment slot="icon">
                        <UserOutline
                          class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                        />
                        {#if accordFilterIndicators.region && !filterCheckedAll.region}
                          <div class={filterIndicatorStyle} ></div>
                        {/if}
                      </svelte:fragment>
                      <Button class="bg-[#234099] hover:bg-[#182D73]"
                        >Sélection des Régions<ChevronDownSolid
                          class="w-3 h-3 ms-2 text-white dark:text-white"
                        /></Button
                      >
                      <Dropdown class={dropdownStyle}>
                        <div slot="header" class="p-3">
                          <SearchBar
                            bind:inputValue={regionInputValue}
                            on:input={(event) => handleInput(event,jsonToItem({ valeursRegion }, 'valeursRegion'),'region')}
                          />
                        </div>
                        {#if regionInputValue.length===0}
                          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Checkbox
                              class="region-all-checkbox"
                              checked={filterCheckedAll.region}
                              on:change={() =>
                                toggleAllCheckbox(
                                  "region"
                                )}>Tout sélectionner</Checkbox
                            >
                          </li>
                        {/if}
                        
                        {#each valeursRegion as region}
                          {#if filterBeneficiaires(region, regionSearchResult)}
                            <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                              <Checkbox class="region-checkbox"
                                checked={region.checked}
                                on:change={() =>
                                  toggleCheckbox(
                                    region,
                                    dropdownSelectionIndicateur9,
                                    valeursRegion,
                                    'accord'
                                  )}>{region.key}</Checkbox
                              >
                            </li>
                          {/if}
                        {/each}
                      </Dropdown>
                      <div class="px-2 pt-1 pb-2">
                        {#if arrayAllIndicateurs.accord}
                          {#each arrayAllIndicateurs.accord as indicateur}
                            {#if indicateur.indicateur === dropdownSelectionIndicateur9.indicateur}
                              {#each indicateur.data as word (word)}
                                <div
                                  class="inline-flex relative px-5 py-2.5 m-1 font-medium text-center text-sm text-white bg-[#0095DC] rounded-lg"
                                >
                                  {word}
                                  <CloseButton
                                    on:click={() =>
                                      closeDiv(
                                        word,
                                        dropdownSelectionIndicateur9,
                                        valeursRegion,
                                        'accord'
                                      )}
                                    class=" absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 !h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                                  />
                                </div>
                              {/each}
                            {/if}
                          {/each}
                        {/if}
                      </div>
                    </SidebarDropdownWrapper>
                  </SidebarGroup>

                  <SidebarGroup class={cardForSideBar}>
                    <SidebarDropdownWrapper label="Département">
                      <svelte:fragment slot="icon">
                        <UsersOutline
                          class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                        />
                        {#if accordFilterIndicators.departement }
                          <div class={filterIndicatorStyle} ></div>
                        {/if}
                      </svelte:fragment>
                      <Button class="bg-[#234099] hover:bg-[#182D73]"
                        >Sélection des Département<ChevronDownSolid
                          class="w-3 h-3 ms-2 text-white dark:text-white"
                        /></Button
                      >
                      <Dropdown class={dropdownStyle}>
                        <div slot="header" class="p-3">
                          <SearchBar
                            bind:inputValue={departementInputValue}
                            on:input={(event) => handleInput(event,jsonToItem({ valeursDepartement }, 'valeursDepartement'),'departement')}
                          />
                        </div>

                        {#if departementInputValue.length===0}
                          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Checkbox
                              class="departement-all-checkbox"
                              checked={filterCheckedAll.departement}
                              on:change={() =>
                                toggleAllCheckbox(
                                  "departement"
                                )}>Tout sélectionner</Checkbox
                            >
                          </li>
                        {/if}
                        
                        {#each valeursDepartement.filter((departement) => {
                          // Vérifie si toutes les valeurs de région ont checked à false
                          const allUnchecked = valeursRegion.every((region) => !region.checked);
                          // Si toutes les valeurs de région sont unchecked, inclure tous les bénéficiaires
                          if (allUnchecked) {
                            return true;
                          } else {
                            // Sinon, inclure les bénéficiaires dont la région correspond à une région sélectionnée
                            return valeursRegion.find((region) => region.id === departement.id_REGION && region.checked);
                          }
                        }) as departement}
                          {#if filterBeneficiaires(departement, departementSearchResult)}
                            <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                              <Checkbox class="departement-checkbox" 
                                checked={departement.checked}
                                on:change={() =>
                                  toggleCheckbox(
                                    departement,
                                    dropdownSelectionIndicateur8,
                                    valeursDepartement,
                                    'accord'
                                  )}>{departement.key}</Checkbox
                              >
                            </li>
                          {/if}
                        {/each}
                      </Dropdown>
                      <div class="px-2 pt-1 pb-2">
                        {#if arrayAllIndicateurs.accord}
                          {#each arrayAllIndicateurs.accord as indicateur}
                            {#if indicateur.indicateur === dropdownSelectionIndicateur8.indicateur}
                              {#each indicateur.data as word (word)}
                                <div class="inline-flex relative px-5 py-2.5 m-1 font-medium text-center text-sm text-white bg-[#0095DC] rounded-lg" >
                                  {word}
                                  <CloseButton
                                    on:click={() =>
                                      closeDiv(
                                        word,
                                        dropdownSelectionIndicateur8,
                                        valeursDepartement,
                                        'accord'
                                      )}
                                    class=" absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 !h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                                  />
                                </div>
                              {/each}
                            {/if}
                          {/each}
                        {/if}
                      </div>
                    </SidebarDropdownWrapper>
                  </SidebarGroup>
                  <SidebarGroup class={cardForSideBar}>
                    <SidebarDropdownWrapper label="Bénéficiaire">
                      <svelte:fragment slot="icon">
                        <UsersGroupOutline
                          class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                        />
                        {#if accordFilterIndicators.beneficiaire}
                          <div class={filterIndicatorStyle} ></div>
                        {/if}
                      </svelte:fragment>
                      <Button class="bg-[#234099] hover:bg-[#182D73]"
                        >Sélection des bénéficiaires<ChevronDownSolid
                          class="w-3 h-3 ms-2 text-white dark:text-white"
                        /></Button
                      >
                      <Dropdown class={dropdownStyle}>
                        <div slot="header" class="p-3">
                          <SearchBar
                            bind:inputValue={beneficiaireAccordInputValue}
                            on:input={(event) => handleInput(event,jsonToItem({ valeursBeneficiaire }, 'valeursBeneficiaire'),'beneficiaireAccord')}
                          />
                        </div>
                        {#if beneficiaireAccordInputValue.length===0}
                          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Checkbox
                              class="beneficiaireAccord-all-checkbox"
                              checked={filterCheckedAll.beneficiaireAccord}
                              on:change={() =>
                                toggleAllCheckbox(
                                  "beneficiaireAccord"
                                )}>Tout sélectionner</Checkbox
                            >
                          </li>  
                        {/if}
                        
                        {#each valeursBeneficiaire.filter((beneficiaire) => {
                          // Vérifie si toutes les valeurs de région ont checked à false
                          const allUnchecked = valeursDepartement.every((departement) => !departement.checked);
                          // Si toutes les valeurs de région sont unchecked, inclure tous les bénéficiaires
                          if (allUnchecked) {
                            return true;
                          } else {
                            // Sinon, inclure les bénéficiaires dont la région correspond à une région sélectionnée
                            return valeursDepartement.find((departement) => departement.id === beneficiaire.id_DEPARTEMENT && departement.checked);
                          }
                        }) as beneficiaires}
                          {#if filterBeneficiaires(beneficiaires, beneficiaireAccordSearchResult)}
                            <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                              <Checkbox class="beneficiaireAccord-checkbox"
                                id={beneficiaires.id_COMMUNE}
                                checked={beneficiaires.checked}
                                on:change={() =>
                                  toggleCheckbox(
                                    beneficiaires,
                                    dropdownSelectionIndicateur4,
                                    valeursBeneficiaire,
                                    'accord'
                                  )}>{beneficiaires.key}</Checkbox
                              >
                            </li>
                          {/if}
                        {/each}
                      </Dropdown>
                      <div class="px-2 pt-1 pb-2">
                        {#if arrayAllIndicateurs.accord}
                          {#each arrayAllIndicateurs.accord as indicateur}
                            {#if indicateur.indicateur === dropdownSelectionIndicateur4.indicateur}
                              {#each indicateur.data as word (word)}
                                <div
                                  class="inline-flex relative px-5 py-2.5 m-1 font-medium text-center text-sm text-white bg-[#0095DC] rounded-lg"
                                >
                                  {word}
                                  <CloseButton
                                    on:click={() =>
                                      closeDiv(
                                        word,
                                        dropdownSelectionIndicateur4,
                                        valeursBeneficiaire,
                                        'accord'
                                      )}
                                    class=" absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 !h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                                  />
                                </div>
                              {/each}
                            {/if}
                          {/each}
                        {/if}
                      </div>
                    </SidebarDropdownWrapper>
                  </SidebarGroup>

                  <SidebarGroup class={cardForSideBar}>
                    <SidebarDropdownWrapper label="Instance">
                      <svelte:fragment slot="icon">
                        <LandmarkOutline
                          class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                        />
                        {#if accordFilterIndicators.instance && !filterCheckedAll.instance}
                          <div class={filterIndicatorStyle} ></div>
                        {/if}
                      </svelte:fragment>
                      <Button class="bg-[#234099] hover:bg-[#182D73]"
                        >Sélection des instances<ChevronDownSolid
                          class="w-3 h-3 ms-2 text-white dark:text-white"
                        /></Button
                      >
                      <Dropdown class={dropdownStyle}>
                        {#if instanceInputValue.length===0}
                          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Checkbox
                              class="instance-all-checkbox"
                              checked={filterCheckedAll.instance}
                              on:change={() =>
                                toggleAllCheckbox(
                                  "instance"
                                )}>Tout sélectionner</Checkbox
                            >
                          </li>  
                        {/if}
                        {#each valeursAttribution as instances}
                          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Checkbox class="instance-checkbox"
                              checked={instances.checked}
                              on:change={() =>
                                toggleCheckbox(
                                  instances,
                                  dropdownSelectionIndicateur1,
                                  valeursAttribution,
                                  'accord'
                                )}>{instances.key}</Checkbox
                            >
                          </li>
                        {/each}
                      </Dropdown>
                      <div class="px-2 pt-1 pb-2">
                        {#if arrayAllIndicateurs.accord}
                          {#each arrayAllIndicateurs.accord as indicateur}
                            {#if indicateur.indicateur === dropdownSelectionIndicateur1.indicateur}
                              {#each indicateur.data as word (word)}
                                <div
                                  class="inline-flex relative px-5 py-2.5 m-1 font-medium text-center text-sm text-white bg-[#0095DC] rounded-lg"
                                >
                                  {word}
                                  <CloseButton
                                    on:click={() =>
                                      closeDiv(
                                        word,
                                        dropdownSelectionIndicateur1,
                                        valeursAttribution,
                                        'accord'
                                      )}
                                    class=" absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 !h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                                  />
                                </div>
                              {/each}
                            {/if}
                          {/each}
                        {/if}
                      </div>
                    </SidebarDropdownWrapper>
                  </SidebarGroup>
                  <SidebarGroup class={cardForSideBar}>
                    <SidebarDropdownWrapper label="Secteur">
                      <svelte:fragment slot="icon">
                        <SwatchbookOutline
                          class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                        />
                        {#if accordFilterIndicators.secteur && !filterCheckedAll.secteur}
                          <div class={filterIndicatorStyle} ></div>
                        {/if}
                      </svelte:fragment>
                      <Button class="bg-[#234099] hover:bg-[#182D73]"
                        >Sélection des secteurs<ChevronDownSolid
                          class="w-3 h-3 ms-2 text-white dark:text-white"
                        /></Button
                      >
                      <Dropdown class={dropdownStyle}>
                        {#if secteurInputValue.length===0}
                          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Checkbox
                              class="secteur-all-checkbox"
                              checked={filterCheckedAll.secteur}
                              on:change={() =>
                                toggleAllCheckbox(
                                  "secteur"
                                )}>Tout sélectionner</Checkbox
                            >
                          </li>  
                        {/if}
                        {#each valeursSecteur as secteurs}
                          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Checkbox class="secteur-checkbox"
                              checked={secteurs.checked}
                              on:change={() =>
                                toggleCheckbox(
                                  secteurs,
                                  dropdownSelectionIndicateur2,
                                  valeursSecteur,
                                  'accord'
                                )}>{secteurs.key}</Checkbox
                            >
                          </li>
                        {/each}
                      </Dropdown>
                      <div class="px-2 pt-1 pb-2">
                        {#if arrayAllIndicateurs.accord}
                          {#each arrayAllIndicateurs.accord as indicateur}
                            {#if indicateur.indicateur === dropdownSelectionIndicateur2.indicateur}
                              {#each indicateur.data as word (word)}
                                <div
                                  class="inline-flex relative px-5 py-2.5 m-1 font-medium text-center text-sm text-white bg-[#0095DC] rounded-lg"
                                >
                                  {word}
                                  <CloseButton
                                    on:click={() =>
                                      closeDiv(
                                        word,
                                        dropdownSelectionIndicateur2,
                                        valeursSecteur,
                                        'accord'
                                      )}
                                    class=" absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 !h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                                  />
                                </div>
                              {/each}
                            {/if}
                          {/each}
                        {/if}
                      </div>
                    </SidebarDropdownWrapper></SidebarGroup
                  >
                  <SidebarGroup class={cardForSideBar}>
                    <SidebarDropdownWrapper label="Domaine">
                      <svelte:fragment slot="icon">
                        <FolderOutline
                          class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                        />
                        {#if accordFilterIndicators.domaine && !filterCheckedAll.domaine}
                          <div class={filterIndicatorStyle} ></div>
                        {/if}
                      </svelte:fragment>
                      <Button class="bg-[#234099] hover:bg-[#182D73]"
                        >Sélection des domaines<ChevronDownSolid
                          class="w-3 h-3 ms-2 text-white dark:text-white"
                        /></Button
                      >
                      <Dropdown class={dropdownStyle}>
                        {#if domaineInputValue.length===0 && !accordFilterIndicators.secteur}
                          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Checkbox
                              class="domaine-all-checkbox"
                              checked={filterCheckedAll.domaine}
                              on:change={() =>
                                toggleAllCheckbox(
                                  "domaine"
                                )}>Tout sélectionner</Checkbox
                            >
                          </li>
                        {/if}
                         
                        {#each valeursDomaine.filter((domaine)=>{
                          const allUnchecked = valeursSecteur.every((secteur) => !secteur.checked);
                          if(allUnchecked){
                            return true;
                          }else{
                            return valeursSecteur.find((secteur) => secteur.id === domaine.id_SECTEUR && secteur.checked);
                          }
                        }) as domaines}
                          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Checkbox
                              class= "domaine-checkbox"
                              checked={domaines.checked}
                              on:change={() =>
                                toggleCheckbox(
                                  domaines,
                                  dropdownSelectionIndicateur3,
                                  valeursDomaine,
                                  'accord'
                                )}>{domaines.key}</Checkbox
                            >
                          </li>
                        {/each}
                      </Dropdown>
                      <div class="px-2 pt-1 pb-2">
                        {#if arrayAllIndicateurs.accord}
                          {#each arrayAllIndicateurs.accord as indicateur}
                            {#if indicateur.indicateur === dropdownSelectionIndicateur3.indicateur}
                              {#each indicateur.data as word (word)}
                                <div
                                  class="inline-flex relative px-5 py-2.5 m-1 font-medium text-center text-sm text-white bg-[#0095DC] rounded-lg"
                                >
                                  {word}
                                  <CloseButton
                                    on:click={() =>
                                      closeDiv(
                                        word,
                                        dropdownSelectionIndicateur3,
                                        valeursDomaine,
                                        'accord'
                                      )}
                                    class=" absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 !h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                                  />
                                </div>
                              {/each}
                            {/if}
                          {/each}
                        {/if}
                      </div>
                    </SidebarDropdownWrapper>
                  </SidebarGroup>

                  <SidebarGroup class={cardForSideBar}>
                    <SidebarDropdownWrapper label="Sources de financement">
                      <svelte:fragment slot="icon">
                        <DollarOutline
                          class="w-auto text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                        />
                        {#if accordFilterIndicators.sourceF && !filterCheckedAll.sourceF}
                          <div class={filterIndicatorStyle} ></div>
                        {/if}
                      </svelte:fragment>

                      <Button class="bg-[#234099] hover:bg-[#182D73]"
                        >Sélection des sources de financement<ChevronDownSolid
                          class="w-3 h-3 ms-2 text-white dark:text-white"
                        /></Button
                      >
                      <Dropdown class={dropdownStyle}>
                        {#if sourceFInputValue.length===0}
                          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Checkbox
                              class="sourceF-all-checkbox"
                              checked={filterCheckedAll.sourceF}
                              on:change={() =>
                                toggleAllCheckbox(
                                  "sourceF"
                                )}>Tout sélectionner</Checkbox
                            >
                          </li>
                        {/if}
                        {#each valeursSourcefinancement as financement}
                          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Checkbox
                              class="sourceF-checkbox"
                              checked={financement.checked}
                              on:change={() =>
                                toggleCheckbox(
                                  financement,
                                  dropdownSelectionIndicateur5,
                                  valeursSourcefinancement,
                                  'accord'
                                )}>{financement.key}</Checkbox
                            >
                          </li>
                        {/each}
                      </Dropdown>
                      <div class="px-2 pt-1 pb-2">
                        {#if arrayAllIndicateurs.accord}
                          {#each arrayAllIndicateurs.accord as indicateur}
                            {#if indicateur.indicateur === dropdownSelectionIndicateur5.indicateur}
                              {#each indicateur.data as word (word)}
                                <div
                                  class="inline-flex relative px-5 py-2.5 m-1 font-medium text-center text-sm text-white bg-[#0095DC] rounded-lg"
                                >
                                  {word}
                                  <CloseButton
                                    on:click={() =>
                                      closeDiv(
                                        word,
                                        dropdownSelectionIndicateur5,
                                        valeursSourcefinancement,
                                        'accord'
                                      )}
                                    class=" absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 !h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                                  />
                                </div>
                              {/each}
                            {/if}
                          {/each}
                        {/if}
                      </div>
                    </SidebarDropdownWrapper>
                  </SidebarGroup>

                  {#if dropdownSelectionIndicateur5.indicateur}
                    {#each dropdownSelectionIndicateur5.data as word (word)}
                      {#if word == 'Coopération'}
                        <SidebarGroup class={cardForSideBar}>
                          <SidebarDropdownWrapper label="Partenaires">
                            <svelte:fragment slot="icon">
                              <UserAddOutline
                                class="w-auto text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                              />
                              {#if accordFilterIndicators.partenaire}
                                <div class={filterIndicatorStyle} ></div>
                              {/if}
                            </svelte:fragment>

                            <Button class="bg-[#234099] hover:bg-[#182D73]"
                              >Sélection des partenaires<ChevronDownSolid
                                class="w-3 h-3 ms-2 text-white dark:text-white"
                              /></Button
                            >
                            <Dropdown class={dropdownStyle}>
                              {#if sourceFInputValue.length===0}
                                <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                  <Checkbox
                                    class="partenaire-all-checkbox"
                                    checked={filterCheckedAll.partenaire}
                                    on:change={() =>
                                      toggleAllCheckbox(
                                        "partenaire"
                                      )}>Tout sélectionner</Checkbox
                                  >
                                </li>
                              {/if}
                              {#each valeursPartenaires as partenaires}
                                <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                  <Checkbox
                                    class="partenaire-checkbox"
                                    checked={partenaires.checked}
                                    on:change={() =>
                                      toggleCheckbox(
                                        partenaires,
                                        dropdownSelectionIndicateur6,
                                        valeursPartenaires,
                                        'accord'
                                      )}>{partenaires.key}</Checkbox
                                  >
                                </li>
                              {/each}
                            </Dropdown>
                            <div class="px-2 pt-1 pb-2">
                              {#if arrayAllIndicateurs.accord}
                                {#each arrayAllIndicateurs.accord as indicateur}
                                  {#if indicateur.indicateur === dropdownSelectionIndicateur6.indicateur}
                                    {#each indicateur.data as word (word)}
                                      <div
                                        class="inline-flex relative px-5 py-2.5 m-1 font-medium text-center text-sm text-white bg-[#0095DC] rounded-lg"
                                      >
                                        {word}
                                        <CloseButton
                                          on:click={() =>
                                            closeDiv(
                                              word,
                                              dropdownSelectionIndicateur6,
                                              valeursPartenaires,
                                              'accord'
                                            )}
                                          class=" absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 !h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                                        />
                                      </div>
                                    {/each}
                                  {/if}
                                {/each}
                              {/if}
                            </div>
                          </SidebarDropdownWrapper>
                        </SidebarGroup>
                      {/if}
                    {/each}
                  {/if}

                  <!-- Niveau avancement -->
                  <SidebarGroup class={cardForSideBar} style="margin-bottom:2em">
                    <SidebarDropdownWrapper label="Niveau d'avancement">
                      <svelte:fragment slot="icon">
                        <OrdoredListOutline
                          class="w-auto text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                        />
                        {#if accordFilterIndicators.niveauAvancement}
                          <div class={filterIndicatorStyle} ></div>
                        {/if}
                      </svelte:fragment>
                      <Button class="bg-[#234099] hover:bg-[#182D73]"
                        >Choix du niveau d'avancement<ChevronDownSolid
                          class="w-3 h-3 ms-2 text-white dark:text-white"
                        /></Button
                      >
                      <Dropdown class={dropdownStyle}>
                        {#each valeursAvancement as avancement}
                          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Checkbox
                              checked={avancement.checked}
                              on:change={() =>
                                toggleCheckbox(
                                  avancement,
                                  dropdownSelectionIndicateur10,
                                  valeursAvancement,
                                  'accord'
                                )}>{avancement.key}</Checkbox
                            >
                          </li>
                        {/each}
                      </Dropdown>
                      <div class="px-2 pt-1 pb-2">
                        {#if arrayAllIndicateurs.accord}
                          {#each arrayAllIndicateurs.accord as indicateur}
                            {#if indicateur.indicateur === dropdownSelectionIndicateur10.indicateur}
                              {#each indicateur.data as word (word)}
                                <div
                                  class="inline-flex relative px-5 py-2.5 m-1 font-medium text-center text-sm text-white bg-[#0095DC] rounded-lg"
                                >
                                  {word}
                                  <CloseButton
                                    on:click={() =>
                                      closeDiv(
                                        word,
                                        dropdownSelectionIndicateur10,
                                        valeursAvancement,
                                        'accord'
                                      )}
                                    class=" absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 !h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                                  />
                                </div>
                              {/each}
                            {/if}
                          {/each}
                        {/if}
                      </div>
                    </SidebarDropdownWrapper>
                  </SidebarGroup>
                </SidebarGroup>
              </TabItem>  
            </div>
            

            
          </Tabs>
        </SidebarWrapper>
        <!-- Bouton Reset Filter -->
        {#if (theme==='accord' && arrayAllIndicateurs.accord.length > 0 )|| (theme==='icsp' && icspFilterIndicator.beneficiaire > 0)}
          <button
            class="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-800 m-4"
            on:click={resetFilters}>Réinitialiser les filtres</button
          >
        {/if}
      </Sidebar>
    </div>
  </Drawer>
{:else}
  <div class="flex items-center justify-center h-screen">
    <Spinner color="green" size={12} />
  </div>
{/if}

<div
  class="flex mx-auto lg:p-0 md:p-4 sm:p-4"
  style="margin-left:{marginRight}rem;height: calc(100vh - {navbarHeight}px);"
>
  <main id="main" class=" maplibregl-map">
    {#if !loadingData}
      <slot {showFinancement} {showICSP} />
    {/if}
  </main>
</div>
