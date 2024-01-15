<script lang="ts">
  import '../app.postcss';
  import { page } from '$app/stores';
  import { onMount, createEventDispatcher } from 'svelte';
  import Main from '../components/Map.svelte';
  import Papa from 'papaparse';
  // Autre fichier, par exemple, votre composant ou page
  import { uniqueValues, findMinMax } from '../../shared/utilitaire';
  import { dataStore, rangeValue, buttonICSP } from '../../shared/store.js';
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
    Label
  } from 'flowbite-svelte';
  import {
    FolderOutline,
    SwatchbookOutline,
    LandmarkOutline,
    DollarOutline,
    UsersGroupOutline,
    ChevronDownSolid
  } from 'flowbite-svelte-icons';
  import { Cog } from 'svelte-heros-v2';
  import { sineIn } from 'svelte/easing';

  //Declare the dispatch
  const dispatch = createEventDispatcher();

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
  let activateClickOutside = true;
  let drawerHidden: boolean = false;
  let navbarHeight = 0;
  let dataArr: any[] = [];
  let mandatData: any[] = [];
  let icspData: any[] = [];
  let valeursAttribution: any[] = [];
  let valeursDomaine: any[] = [];
  let valeursSecteur: any[] = [];
  let valeursBeneficiaire: any[] = [];
  let valeursSourcefinancement: any[] = [];
  let loadingData = true;
  let drawerWidth = 0;
  let activeUrl;
  let showFinancement = false;
  let showICSP = true;
  let minMaxYear: {
    max: any;
    min: any;
  };
  let valueSliderLanding = 0;

  onMount(async function () {
    try {
      const { mandatData, dataArr, icspData } = await fetchData();

      // Mettez à jour les propriétés individuelles du store
      dataStore.update((store) => {
        store.dataArr = dataArr;
        store.mandatData = mandatData;
        store.icspData = icspData;

        return store;
      });

      valeursAttribution = uniqueValues(dataArr, "Instance d'attribution");
      valeursSecteur = uniqueValues(dataArr, 'Secteurs');
      valeursDomaine = uniqueValues(dataArr, 'Domaines');
      valeursBeneficiaire = uniqueValues(dataArr, 'Bénéficiaire');
      valeursSourcefinancement = uniqueValues(dataArr, 'Source_financement');

      loadingData = false;

      minMaxYear = findMinMax(icspData, 'ANNEE');
      valueSliderLanding = minMaxYear.min;
      rangeValue.set(valueSliderLanding);

      // Sélectionnez l'élément du drawer par son identifiant
      const drawer = document.getElementById('sidebar');
      const navbar = document.getElementById('myNavbar'); // Remplacez 'navbar' par l'ID réel de votre navbar
      // Vérifiez si l'élément a été trouvé
      /*       if (drawer) {
        console.log(drawer);
        // Obtenez la largeur calculée du drawer
        const drawerWidth = drawer.offsetWidth;
        const widthTotal = navbar.clientWidth;
        console.log('Largeur de la barre latérale:', drawerWidth, 'pixels');
      } else {
        console.error("L'élément avec l'ID 'sidebar' n'a pas été trouvé.");
      }
*/

      if (navbar) {
        navbarHeight = navbar.clientHeight;
      }
    } catch (error) {
      console.error(error);
    }
  });

  onMount(() => {
    if (width >= breakPoint) {
      drawerHidden = false;
      activateClickOutside = false;
    } else {
      drawerHidden = true;
      activateClickOutside = true;
    }
  });

  const toggleSide = () => {
    if (width < breakPoint) {
      drawerHidden = !drawerHidden;
    }
  };
  const toggleDrawer = () => {
    drawerHidden = false;
  };

  $: {
    activeUrl = $page.url.pathname;
    let spanClass = 'pl-2 self-center text-md text-gray-900 dark:text-white';
    let divClass = 'w-full md:block md:w-auto pr-8';
    let ulClass =
      'flex flex-col p-4 mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-lg md:font-medium';
    rangeValue.set(valueSliderLanding);
  }

  function reject(error: any) {
    throw new Error('Function not implemented.');
  }

  $: if (width >= breakPoint) {
    drawerHidden = false;
    activateClickOutside = false;
  } else {
    drawerHidden = true;
    activateClickOutside = true;
  }
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />
<Navbar id="myNavbar" let:hidden let:toggle>
  <NavHamburger onClick={toggleDrawer} btnClass="ml-3 lg:hidden" />
  <NavBrand href="/" class="lg:ml-64">
    <img
      src={'/logo-plateforme_little.jpg'}
      alt="logo-plateforme"
      class="mx-auto max-w-full h-10"
    />
    <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white pl-4">
      Plateforme Urbaine Cameroun
    </span>
  </NavBrand>
  <NavHamburger on:click={toggle} />
  <!--   <NavUl {hidden} {divClass} {ulClass}>
    <NavLi href="/">Home</NavLi>
    <NavLi href="/pages/about">About</NavLi>
    <NavLi href="https://github.com/shinokada/flowbite-sveltekit-responsive-sidebar-layout"
      >GitHub</NavLi
    >
  </NavUl> -->
</Navbar>
{#if !loadingData}
  <Drawer
    transitionType="fly"
    {backdrop}
    {transitionParams}
    bind:hidden={drawerHidden}
    bind:activateClickOutside
    class="overflow-scroll pb-32"
    id="sidebar"
  >
    <div class="flex items-center">
      <CloseButton on:click={() => (drawerHidden = true)} class="mb-4 dark:text-white lg:hidden" />
    </div>
    <Sidebar asideClass="w-54">
      <SidebarWrapper divClass="overflow-y-auto py-4 px-3 rounded dark:bg-gray-800">
        <div class="grid grid-cols-2">
          <Radio
            name="custom"
            on:click={() => {
              showICSP = true;
              showFinancement = false;
              buttonICSP.set(showICSP);
            }}
            custom
            checked
          >
            <div
              class="inline-flex justify-center items-center p-2 w-full h-full text-lg font-semibold bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-primary-500 peer-checked:border-primary-600 peer-checked:text-primary-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              ICSP
            </div></Radio
          >

          <Radio
            name="custom"
            on:click={() => {
              showICSP = false;
              showFinancement = true;
              buttonICSP.set(showICSP);
            }}
            custom
          >
            <div
              class="inline-flex justify-center items-center p-2 w-full h-full text-lg font-semibold bg-white rounded-lg border border-gray-200 cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-primary-500 peer-checked:border-primary-600 peer-checked:text-primary-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <span class="flex items-center">Accord de financement</span>
            </div>
          </Radio>
        </div>

        <br />
        {#if showFinancement}
          <SidebarGroup id="finance">
            <SidebarDropdownWrapper label="Bénéficiaire">
              <svelte:fragment slot="icon">
                <UsersGroupOutline
                  class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                />
              </svelte:fragment>
              <Button color="green"
                >Sélection des bénéficiaires<ChevronDownSolid
                  class="w-3 h-3 ms-2 text-white dark:text-white"
                /></Button
              >
              <Dropdown class="w-48 p-3 overflow-y-auto space-y-1 text-sm">
                {#each valeursBeneficiaire as beneficiaires}
                  <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <Checkbox>{beneficiaires}</Checkbox>
                  </li>
                {/each}
              </Dropdown>
            </SidebarDropdownWrapper>

            <SidebarDropdownWrapper label="Instance d'attribution">
              <svelte:fragment slot="icon">
                <LandmarkOutline
                  class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                />
              </svelte:fragment>
              <Button color="green"
                >Sélection des instances<ChevronDownSolid
                  class="w-3 h-3 ms-2 text-white dark:text-white"
                /></Button
              >
              <Dropdown class="w-48 p-3 overflow-y-auto space-y-1 text-sm">
                {#each valeursAttribution as instances}
                  <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <Checkbox>{instances}</Checkbox>
                  </li>
                {/each}
              </Dropdown>
            </SidebarDropdownWrapper>

            <SidebarDropdownWrapper label="Domaine">
              <svelte:fragment slot="icon">
                <FolderOutline
                  class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                />
              </svelte:fragment>
              <Button color="green"
                >Sélection des projets<ChevronDownSolid
                  class="w-3 h-3 ms-2 text-white dark:text-white"
                /></Button
              >
              <Dropdown class="w-48 p-3 overflow-y-auto  space-y-1 text-sm">
                {#each valeursDomaine as domaines}
                  <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <Checkbox>{domaines}</Checkbox>
                  </li>
                {/each}
              </Dropdown>
            </SidebarDropdownWrapper>

            <SidebarDropdownWrapper label="Secteur">
              <svelte:fragment slot="icon">
                <SwatchbookOutline
                  class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                />
              </svelte:fragment>
              <Button color="green"
                >Sélection des secteurs<ChevronDownSolid
                  class="w-3 h-3 ms-2 text-white dark:text-white"
                /></Button
              >
              <Dropdown class="w-48 p-3 overflow-y-auto  space-y-1 text-sm">
                {#each valeursSecteur as secteurs}
                  <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <Checkbox>{secteurs}</Checkbox>
                  </li>
                {/each}
              </Dropdown>
            </SidebarDropdownWrapper>

            <SidebarDropdownWrapper label="Financement">
              <svelte:fragment slot="icon">
                <DollarOutline
                  class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                />
              </svelte:fragment>
              <Button color="green"
                >Sélection des sources de financement<ChevronDownSolid
                  class="w-3 h-3 ms-2 text-white dark:text-white"
                /></Button
              >
              <Dropdown class="w-48 p-3 overflow-y-auto  space-y-1 text-sm">
                {#each valeursSourcefinancement as financement}
                  <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <Checkbox>{financement}</Checkbox>
                  </li>
                {/each}
              </Dropdown>
            </SidebarDropdownWrapper>
          </SidebarGroup>
        {/if}

        {#if showICSP}
          <!-- Afficher le SideGroup correspondant à ICSP -->
          <SidebarGroup id="icsp">
            <!-- Contenu de votre SideGroup pour ICSP -->
            <!--      <h5
              class="mb-2 text-2xl font-bold tracking-tight text-center text-gray-900 dark:text-white"
            >
              Montants des ICSP
            </h5>
            
            <ButtonGroup>
              <Button outline color="dark">Montants annuels</Button>
              <Button outline color="dark">Montants trimestrielles</Button>
            </ButtonGroup> -->
            <hr />
            <!-- Contenu de votre SideGroup pour ICSP -->
            <h5
              class="mb-2 text-2xl font-bold tracking-tight text-center text-gray-900 dark:text-white"
            >
              Année
            </h5>
            <Range
              id="range-minmax"
              min={minMaxYear.min}
              max={minMaxYear.max}
              bind:value={valueSliderLanding}
              step="1"
            />
            <p>Value: {valueSliderLanding}</p>
          </SidebarGroup>
        {/if}
      </SidebarWrapper>
    </Sidebar>
  </Drawer>
{/if}

<div class="flex mx-auto lg:p-0 md:p-4 sm:p-4" style="height: calc(100vh - {navbarHeight}px);">
  <main id="main" class="lg:ml-[20rem] maplibregl-map">
    {#if !loadingData}
      <slot {showFinancement} {showICSP} />
    {/if}
  </main>
</div>
