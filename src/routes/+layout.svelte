<script lang="ts">
  import '../app.postcss';
  import { page } from '$app/stores';
  import { onMount, createEventDispatcher } from 'svelte';
  import Main from '../components/Map.svelte';
  import Papa from 'papaparse';
  // Autre fichier, par exemple, votre composant ou page
  import { uniqueValues, findMinMax, jsonToItem } from '../../shared/utilitaire';
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
    UsersOutline
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
  let icspData: any[] = [];
  let valeursAttribution: any[] = [];
  let valeursDomaine: any[] = [];
  let valeursSecteur: any[] = [];
  let valeursBeneficiaire: any[] = [];
  let valeursBeneficiaire2: any[] = [];
  let valeursSourcefinancement: any[] = [];
  let valeursDepartement: any[] = [];
  let valeursRegion: any[] = [];
  let valeursPartenaires: any[] = [];
  let arrayAllIndicateurs = { accord: [], icsp: [] };
  let arrayAllIndicateursICSP: any[] = [];
  let loadingData = true;

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

  let showProgressBar = true; // Définissez la variable pour afficher la barre de progression
  let progressValue = 0; // Initialisez la valeur de la progression
  let minSliderValue = minMaxYearAccord.min;
  let maxSliderValue = minMaxYearAccord.max;
  let minSliderICSP = minMaxYearICSP.min;
  let maxSliderICSP = minMaxYearICSP.max;

  let checkedOptions: { [key: string]: boolean } = {};
  //Liste déroulante et search bar
  let inputValue = '';
  let indicateur5 = 'Source_financement';
  let indicateur1 = "Instance d'attribution";
  let indicateur2 = 'Secteurs';
  let indicateur3 = 'Domaines';
  let indicateur4 = 'Bénéficiaire';
  let indicateur8 = 'Département';
  let indicateur9 = 'Région';
  let indicateur6 = 'Partenaires';

  let indicateur7 = 'COMMUNE';
  let filteredItems: any[] = [];
  //ICSP
  let dropdownSelectionIndicateur7 = { indicateur: '', data: [] };
  //Accord
  let dropdownSelectionIndicateur9 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur8 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur6 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur5 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur4 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur3 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur2 = { indicateur: '', data: [] };
  let dropdownSelectionIndicateur1 = { indicateur: '', data: [] };
  let dropdownSelectionsAll: any[] = [];

  let cardForSideBar =
    'bg-white dark:bg-#23409A-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md p-2 mb-2';

  let dropdownStyle = 'w-48 overflow-y-auto py-1 h-48';
  onMount(async function () {
    try {
      const { mandatData, dataArr, icspData } = await fetchData();

      // Mettez à jour les propriétés individuelles du store
      dataStore.update((store) => {
        loadingData = false;
        store.icspData = icspData;
        store.dataArr = dataArr;
        store.mandatData = mandatData;

        return store;
      });

      valeursAttribution = uniqueValues(dataArr, indicateur1);
      valeursSecteur = uniqueValues(dataArr, indicateur2);
      valeursDomaine = uniqueValues(dataArr, indicateur3);
      valeursBeneficiaire = uniqueValues(dataArr, indicateur4);
      valeursBeneficiaire2 = uniqueValues(icspData, indicateur7);
      valeursSourcefinancement = uniqueValues(dataArr, indicateur5);
      valeursPartenaires = uniqueValues(dataArr, indicateur6);
      valeursDepartement = uniqueValues(dataArr, indicateur8);
      valeursRegion = uniqueValues(dataArr, indicateur9);

      //ICSP
      dropdownSelectionIndicateur7.indicateur = indicateur7;
      // ACCORD
      dropdownSelectionIndicateur9.indicateur = indicateur9;
      dropdownSelectionIndicateur8.indicateur = indicateur8;
      dropdownSelectionIndicateur6.indicateur = indicateur6;
      dropdownSelectionIndicateur5.indicateur = indicateur5;
      dropdownSelectionIndicateur4.indicateur = indicateur4;
      dropdownSelectionIndicateur3.indicateur = indicateur3;
      dropdownSelectionIndicateur2.indicateur = indicateur2;
      dropdownSelectionIndicateur1.indicateur = indicateur1;

      // Ajoutez les objets à l'array dropdownSelections
      dropdownSelectionsAll.push(
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

      // Sélectionnez l'élément du drawer par son identifiant
      const drawer = document.getElementById('sidebar');
      const navbar = document.getElementById('myNavbar'); // Remplacez 'navbar' par l'ID réel de votre navbar

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
    section: string
  ) {
    checkedOptions.checked = !checkedOptions.checked;

    updateSelectedWords(array, unique, section); // Mettre à jour les mots sélectionnés
  }

  function updateSelectedWords(
    array: { indicateur: string; data: never[] } | undefined,
    unique: any[],
    section: string
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
    // Trouvez l'objet correspondant dans valeursSourcefinancement
    const word = unique.find((value) => value.key === wordToRemove);

    if (word) {
      // Mettez à jour la propriété checked de l'objet à false
      word.checked = false;
    }

    updateSelectedWords(array, unique, section); // Mettre à jour les mots sélectionnés
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

  const handleInput = (data) => {
    return (filteredItems = data.filter((item) =>
      item.toLowerCase().match(inputValue.toLowerCase())
    ));
  };

  function filterBeneficiaires(beneficiaires, filteredItems) {
    return filteredItems.length === 0 || filteredItems.includes(beneficiaires.key);
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
        <SidebarWrapper divClass="overflow-y-auto">
          <Tabs style="full" class="space-x-0 w-full flex !flex-nowrap">
            <TabItem
              class="text-xs poppins-medium w-full  "
              open
              on:click={() => {
                showICSP = true;
                showFinancement = false;
                buttonICSP.set(showICSP);
              }}
            >
              <div slot="title" class="flex items-center gap-1 !rounded-none">
                <DollarOutline size="sm" />
                Finance local
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

              <SidebarGroup class={cardForSideBar}>
                <SidebarDropdownWrapper label="Bénéficiaire">
                  <svelte:fragment slot="icon">
                    <UsersGroupOutline
                      class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    />
                  </svelte:fragment>
                  <Button class="bg-[#234099] hover:bg-[#182D73]"
                    >Sélection des bénéficiaires<ChevronDownSolid
                      class="w-3 h-3 ms-2 text-white dark:text-white"
                    /></Button
                  >
                  <Dropdown class={dropdownStyle}>
                    <div slot="header" class="p-3">
                      <SearchBar
                        bind:inputValue
                        on:input={handleInput(
                          jsonToItem({ valeursBeneficiaire2 }, 'valeursBeneficiaire2')
                        )}
                      />
                    </div>
                    {#each valeursBeneficiaire2 as beneficiaires}
                      {#if filterBeneficiaires(beneficiaires, filteredItems)}
                        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                          <Checkbox
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
                buttonICSP.set(showICSP);
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
                    </svelte:fragment>
                    <Button class="bg-[#234099] hover:bg-[#182D73]"
                      >Sélection des Régions<ChevronDownSolid
                        class="w-3 h-3 ms-2 text-white dark:text-white"
                      /></Button
                    >
                    <Dropdown class={dropdownStyle}>
                      <div slot="header" class="p-3">
                        <SearchBar
                          bind:inputValue
                          on:input={handleInput(jsonToItem({ valeursRegion }, 'valeursRegion'))}
                        />
                      </div>
                      {#each valeursRegion as region}
                        {#if filterBeneficiaires(region, filteredItems)}
                          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Checkbox
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
                    </svelte:fragment>
                    <Button class="bg-[#234099] hover:bg-[#182D73]"
                      >Sélection des Département<ChevronDownSolid
                        class="w-3 h-3 ms-2 text-white dark:text-white"
                      /></Button
                    >
                    <Dropdown class={dropdownStyle}>
                      <div slot="header" class="p-3">
                        <SearchBar
                          bind:inputValue
                          on:input={handleInput(
                            jsonToItem({ valeursDepartement }, 'valeursDepartement')
                          )}
                        />
                      </div>
                      {#each valeursDepartement as departement}
                        {#if filterBeneficiaires(departement, filteredItems)}
                          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Checkbox
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
                              <div
                                class="inline-flex relative px-5 py-2.5 m-1 font-medium text-center text-sm text-white bg-[#0095DC] rounded-lg"
                              >
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
                    </svelte:fragment>
                    <Button class="bg-[#234099] hover:bg-[#182D73]"
                      >Sélection des bénéficiaires<ChevronDownSolid
                        class="w-3 h-3 ms-2 text-white dark:text-white"
                      /></Button
                    >
                    <Dropdown class={dropdownStyle}>
                      <div slot="header" class="p-3">
                        <SearchBar
                          bind:inputValue
                          on:input={handleInput(
                            jsonToItem({ valeursBeneficiaire }, 'valeursBeneficiaire')
                          )}
                        />
                      </div>
                      {#each valeursBeneficiaire as beneficiaires}
                        {#if filterBeneficiaires(beneficiaires, filteredItems)}
                          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Checkbox
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
                    </svelte:fragment>
                    <Button class="bg-[#234099] hover:bg-[#182D73]"
                      >Sélection des instances<ChevronDownSolid
                        class="w-3 h-3 ms-2 text-white dark:text-white"
                      /></Button
                    >
                    <Dropdown class={dropdownStyle}>
                      {#each valeursAttribution as instances}
                        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                          <Checkbox
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
                    </svelte:fragment>
                    <Button class="bg-[#234099] hover:bg-[#182D73]"
                      >Sélection des secteurs<ChevronDownSolid
                        class="w-3 h-3 ms-2 text-white dark:text-white"
                      /></Button
                    >
                    <Dropdown class={dropdownStyle}>
                      {#each valeursSecteur as secteurs}
                        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                          <Checkbox
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
                                    closeDiv(word, dropdownSelectionIndicateur2, valeursSecteur)}
                                  class=" absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 !h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                                />
                              </div>
                              ,'accord'
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
                    </svelte:fragment>
                    <Button class="bg-[#234099] hover:bg-[#182D73]"
                      >Sélection des projets<ChevronDownSolid
                        class="w-3 h-3 ms-2 text-white dark:text-white"
                      /></Button
                    >
                    <Dropdown class={dropdownStyle}>
                      {#each valeursDomaine as domaines}
                        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                          <Checkbox
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
                                    closeDiv(word, dropdownSelectionIndicateur3, valeursDomaine)}
                                  class=" absolute focus:outline-none whitespace-normal focus:ring-2 p-1.5  hover:bg-red-500 ms-auto inline-flex items-center justify-center w-6 !h-6 font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2"
                                />
                              </div>
                              ,'accord'
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
                    </svelte:fragment>

                    <Button class="bg-[#234099] hover:bg-[#182D73]"
                      >Sélection des sources de financement<ChevronDownSolid
                        class="w-3 h-3 ms-2 text-white dark:text-white"
                      /></Button
                    >
                    <Dropdown class={dropdownStyle}>
                      {#each valeursSourcefinancement as financement}
                        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                          <Checkbox
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

                <SidebarGroup class={cardForSideBar}>
                  <SidebarDropdownWrapper label="Partenaires">
                    <svelte:fragment slot="icon">
                      <UserAddOutline
                        class="w-auto text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                      />
                    </svelte:fragment>

                    <Button class="bg-[#234099] hover:bg-[#182D73]"
                      >Sélection des partenaires<ChevronDownSolid
                        class="w-3 h-3 ms-2 text-white dark:text-white"
                      /></Button
                    >
                    <Dropdown class={dropdownStyle}>
                      {#each valeursPartenaires as partenaires}
                        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                          <Checkbox
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
              </SidebarGroup>
            </TabItem>
            <TabItem disabled>
              <div slot="title" class=" w-full items-center gap-1">
                <DollarOutline size="sm" />
                Dettes
              </div>
            </TabItem>
          </Tabs>
        </SidebarWrapper>
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
