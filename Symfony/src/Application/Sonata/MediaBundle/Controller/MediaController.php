<?php

namespace Application\Sonata\MediaBundle\Controller;

use Sonata\MediaBundle\Controller\MediaController as BaseMediaController;
use Sonata\MediaBundle\Model\MediaInterface;
use Sonata\MediaBundle\Provider\MediaProviderInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class MediaController extends BaseMediaController
{
    public function detectDevice()
    {
        $mobileDetector = $this->get('mobile_detect.mobile_detector');
        $touchDevice = $mobileDetector->isMobile() || $mobileDetector->isTablet();

        return $touchDevice;
    }

    /**
     * @throws NotFoundHttpException
     *
     * @param int $id
     * @param string $format
     *
     * @return Response
     */
    public function viewAction($id, $format = 'reference')
    {
        $id = (int) $id;
//        $media = $this->getMedia($id);

        $media = $this->getOne($id);

        if (!$media) {
            throw new NotFoundHttpException(sprintf('Unable to find the media with the id : %s', $id));
        }

        if (!$this->get('sonata.media.pool')->getDownloadSecurity($media)->isGranted($media, $this->getRequest())) {
            throw new AccessDeniedException();
        }

        $mediaAll = $this->getAll();

        if (!$mediaAll) {
            throw new NotFoundHttpException('Unable to retrieve the medias');
        }

        $provider = $this->container->get($media->getProviderName());

        $thumbnailFormat = 'default_small';
        //$format = $provider->getFormatName($media, $format);
        $format_definition = $provider->getFormat($thumbnailFormat);


//        $request = $this->container->get('request');
//        $currentRoute = $request->get('_route');
//        $currentUrl = $this->get('router')->generate($currentRoute, array(), true);
//
//        var_dump($currentUrl);

        $options = array();
        $count = '';
        $providerRef = '';

        foreach($mediaAll as $key => $value)
        {
            $options[$key]['id'] = $value->getId();
            $options[$key]['title'] = $value->getName();
            $options[$key]['width'] = '';
            $options[$key]['height'] = '';

            if ($format_definition['width']) {
                $options[$key]['width'] = $format_definition['width'];
            }
            if ($format_definition['height']) {
                $options[$key]['height'] = $format_definition['height'];
            }

            $options[$key]['src'] = $provider->generatePublicUrl($value, $thumbnailFormat);

            $providerReference = $value->getProviderReference();
            $options[$key]['jsonData'] = $this->getApiJsonInformations($providerReference);
            $options[$key]['duration'] = $this->convertISO8601Duration($options[$key]['jsonData']['duration']);

            if($value->getId() === $id) {
                $options[$key]['current'] = 'active';
                $count = $options[$key]['jsonData']['viewCount'];
                $providerRef = $providerReference;
            }
        }

        return $this->render('SonataMediaBundle:Media:view.html.twig', array(
            'media'         => $media,
            'options'       => $options,
            'count'         => $count,
            'providerRef'   => $providerRef,
            'formats'       => $this->get('sonata.media.pool')->getFormatNamesByContext($media->getContext()),
            'format'        => $format,
            'isTouchDevice' => $this->detectDevice()
        ));
    }

    /**
     * Retrieve JSON data from Youtube API V3 for current video
     *
     * @param string $providerReference
     *
     * @return array
     */
    public function getApiJsonInformations($providerReference)
    {
        $apiKey = 'AIzaSyCQ7eJRRYdjqGm5Fsge53wbpSlN-FfqUOs';
        $url = 'https://www.googleapis.com/youtube/v3/videos?id='.$providerReference.'&key='.$apiKey.'&part=snippet,contentDetails,statistics,status';
        $data = file_get_contents($url);

        if (!$data) {
            return false;
        }

        $metadata = json_decode($data);

        if (!$metadata) {
            throw new \RuntimeException('Unable to decode the video information for :' . $data);
        }

        $jsonResponseList = array(
            'title'     => $metadata->items[0]->snippet->title,
            'duration'  => $metadata->items[0]->contentDetails->duration,
            'viewCount' => $metadata->items[0]->statistics->viewCount
        );

        return $jsonResponseList;
    }

    /**
     * Convert the format of the video duration
     * PT#H#M#S -> #:#:#
     *
     * @return string
     */
    public function convertISO8601Duration($str) {
        preg_match_all('/\d+/', $str, $matches);

        for($i=1; $i<=2; $i++) {
            if(isset($matches[0][$i])) {
                if (1 === preg_match_all( '/[0-9]/', $matches[0][$i])) {
                    $zeroBefore = '0'.$matches[0][$i];
                    $matches[0][$i] = $zeroBefore;
                }
            }
        }
        return implode(':', $matches[0]);
    }

    /**
     * Retrieve one media with custom youtube provider
     *
     * @param int $id
     *
     * @return MediaInterface
     */
    public function getOne($id)
    {
        return $this->get('sonata.media.manager.media')->findOneBy(array(
            'id'           => $id,
            'providerName' => 'sonata.media.provider.custom'
        ));
    }

    /**
     * Retrieve all medias with custom youtube provider
     *
     * @return MediaInterface
     */
    public function getAll()
    {
        return $this->get('sonata.media.manager.media')->findBy(
            array('providerName' => 'sonata.media.provider.custom'),
            array('createdAt' => 'DESC')
        );
    }
}